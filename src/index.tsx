import { Cookie, Elysia, t } from "elysia";
import { Stream } from '@elysiajs/stream'
import { html } from '@elysiajs/html' 
import { Database } from "bun:sqlite";

import Page from "./components/page";
import TxtResponse from "./components/response";  
import Command from "./components/command";
import { as } from "elysia/dist/index-3yRrZCrW";


const azheroku_domain = process.env.AZHEROKU_DOMAIN as string
const azheroku_consumer_key = process.env.AZHEROKU_CONSUMER_KEY as string
const azheroku_consumer_secret = process.env.AZHEROKU_CONSUMER_SECRET as string
const azheroku_callback_url = process.env.AZHEROKU_CALLBACK_URL as string

const LoginButton = () =>
  <div>Log into Salesforce first here
        <a class="btn btn-primary min-h-fit h-auto p-2" href={`https://${azheroku_domain}/services/oauth2/authorize?` +
        `client_id=${azheroku_consumer_key}&` +
        `redirect_uri=${azheroku_callback_url}&` +
        'response_type=code'}>Login to Salesforce</a>
  </div>

type SFDC_Auth = {
    access_token: string,
    signature: string,
    scope: string,
    id_token: string,
    instance_url: string,
    id: string,
    token_type: string,
    issued_at: string
}

const SFDCType2SQL = {
  "address": "TEXT",
  "boolean": "BOOLEAN",
  "currency": "DECIMAL(10,5)",
  "date": "DATE",
  "datetime": "DATETIME",
  "double": "DOUBLE",
  "id": "TEXT PRIMARY KEY",
  "int": "INTEGER",
  "phone": "TEXT",
  "picklist": "TEXT",
  "reference": "TEXT",
  "string": "TEXT",
  "textarea": "TEXT",
  "url": "TEXT"
}

enum SYNC_MODE {
  NONE = 0,
  PULL = 1,
  PUSH = 2,
  SYNC = 3
}

const db = new Database(":memory:") 
//const db = new Database("mydb.sqlite");
db.query(`CREATE TABLE connections (name TEXT PRIMARY KEY, auth TEXT NOT NULL, mode INTEGER, lastrun DATE, laststatus INTEGER, lastmessage TEXT);`).run();
const upsertConnection = db.query<void, {$name: string, $auth: string, $mode: number}>(`INSERT INTO connections (name, auth, mode) VALUES  ($name, json($auth), $status) ON CONFLICT(name) DO UPDATE SET auth=json($auth), mode=$mode`);
const getConnection = db.query<{auth: string, mode: number}, {$name: string}>(`select name, auth, mode FROM connections WHERE name = $name`);

db.query(`CREATE TABLE monitor (date DATETIME, connection_name TEXT, sObject TEXT, describeCalls NUMBER, queryCalls NUMBER, upsertCalls INTEGER, status INTEGER, message TEXT);`).run();


db.query(`CREATE TABLE syncd_objects (sobject_name TEXT PRIMARY KEY, sfdc_definition TEXT NOT NULL, sql_definition TEXT, status INTEGER, last_sync DATE);`).run();
const upsertSync = db.query<void, {$sobject_name: string, $sfdc_definition: string, $sql_definition: string, $status: number}>(`INSERT INTO syncd_objects (sobject_name, sfdc_definition, sql_definition, status) VALUES  ($sobject_name, json($sfdc_definition), $sql_definition, $status) ON CONFLICT(sobject_name) DO UPDATE SET sfdc_definition=json($sfdc_definition), status=$status`);
const querySync = db.query<{sfdc_definition: string, sql_definition: string, status: number}, {$sobjectName: string}>(`select sfdc_definition, sql_definition, status FROM syncd_objects WHERE sobject_name = $sobjectName`);
const queryAllSync = db.query<{sobject_name: string, sfdc_definition: string, sql_definition: string, status: number}, null>(`select sobject_name, sfdc_definition, sql_definition, status FROM syncd_objects`);


type SFDC_SOBJECT_DEFINITION = {
  name: string,
  label: string,
  custom: boolean,
  keyPrefix: string,
  fields: {
    calculated: boolean,
    custom: boolean,
    byteLength: number,
    name: string,
    label: string,
    length: number,
    nameField: boolean,
    idLookup: boolean,
    type: string,
    unique: boolean
  }[]
}


const help = <TxtResponse assistantMessage={<div><Command command='/monitor'/> <Command command='/status'/> <Command command='/sObjects'/> <Command command='/status'/> to list sObjects or... just chat to me, I can be very helpful</div>} />

const app = new Elysia()
  .use(html()) 
  .state('sfdc_auth', {} as SFDC_Auth)
  .get("/", ({ query: { sfdc_auth_redirect }, store: {sfdc_auth}}) => 
      <Page title="AzSalesforceConnect">
        { help } 
        { sfdc_auth_redirect === 'true' && sfdc_auth.access_token &&
          <TxtResponse assistantMessage={<div>Logged into Salesforce, now you can list sObjects here <Command command='/sObjects'/>, or just chat to me, I can be very helpful</div>} />
        }
      </Page>
  , {
    query: t.Object({
      sfdc_auth_redirect: t.String({default: 'false'})
    })
  })
  .get('/help', () =>
      help
    )
  .get('/status', () => {
    const syncs = queryAllSync.all(null)
    return <TxtResponse assistantMessage={<div>
      <h1>Sync Status</h1>
      <table class="table table-xs">
        <tr>
          <th>sObject</th>
          <th>status</th>
        </tr>
        { syncs.map((sync) =>
          <tr>
            <td>{sync.sobject_name}</td>
            <td>{SYNC_MODE[sync.status]}</td>
          </tr>
        )}
      </table>
    </div>} />
  })
  // https://developer.salesforce.com/docs/atlas.en-us.api_rest.meta/api_rest/dome_describeGlobal.htm
  .get("/sObjects", async ({store: {sfdc_auth}}) => {

    if (!sfdc_auth.access_token) return  <TxtResponse assistantMessage={<LoginButton/>} />

    const response = await fetch(`${sfdc_auth.instance_url}/services/data/v54.0/sobjects/`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${sfdc_auth.access_token}`
      }
    })
    const resjson = await response.json()

    return (
      <table class="table table-xs">
        <tr>
          <th>Name</th>
          <th>Label</th>
          <th>Describe</th>
          <th>Sync</th>
        </tr>
        { resjson.sobjects.filter((s: any) => s.name === 'Account' || s.name === 'Contact').map((sObject: any) =>
          <tr>
            <td>{sObject.name}</td>
            <td>{sObject.label}</td>
            <td><Command command={`/sObjects/${sObject.name}/describe`}/></td>
            <td><Command command={`/sObjects/${sObject.name}/sync`}/></td>
            <td><Command command={`/sObjects/${sObject.name}/query`}/></td>
          </tr>
        )}
      </table>
    )
  })
  .get("/sObjects/:sObject/:mode", async ({params: {sObject, mode}, store: {sfdc_auth}, cookie: { session }}) => {

    if (!sfdc_auth.access_token) return  <TxtResponse assistantMessage={<LoginButton/>}/>

    try {
      const response = await fetch(`${sfdc_auth.instance_url}/services/data/v54.0/sobjects/${sObject}/describe/`, { headers: {
          'Authorization': `Bearer ${sfdc_auth.access_token}` }
      })
      const sobjdef = await response.json() as SFDC_SOBJECT_DEFINITION

      
      if (mode === 'query') {
        const querystr = `${sfdc_auth.instance_url}/services/data/v54.0/query?q=select+${sobjdef.fields.map(f => f.name).join(',')}+from+${sObject}`
        const qresponse = await fetch(querystr, { headers: {
            'Authorization': `Bearer ${sfdc_auth.access_token}` }
        })
        const sobjdata = await qresponse.json()
        return (
          <table class="table table-xs">
            <th>
              {sobjdef.fields.map((f: any) => <th>{f.label}</th>)}
            </th>
            { sobjdata.records.map((record: any) =>
              <tr>
                {sobjdef.fields.map((f: any) => <td>{record[f.name]}</td>)}
              </tr>
            )}
          </table>
        )
      }

      if (mode === 'describe') return (
        <table class="table table-xs">
          <thead>
          <tr>
            <th>name</th>
            <th>label</th>
            <th>length</th>
            <th>nameField</th>
            <th>idLookup</th>
            <th>type</th>
            <th>unique</th>
            <th>length</th>
          </tr>
          </thead>
          <tbody>
          { sobjdef.fields.map((sObject: any) =>
            <tr>
              <td>{sObject.name}</td>
              <td>{sObject.label}</td>
              <td>{sObject.length}</td>
              <td>{sObject.nameField}</td>
              <td>{sObject.idLookup}</td>
              <td>{sObject.type}</td>
              <td>{sObject.unique}</td>
              <td>{sObject.length}</td>
            </tr>
          )}
          </tbody>
        </table>
      )

      db.query(`CREATE TABLE ${sObject} (${sobjdef.fields.map(f => `${f.name} ${SFDCType2SQL[f.type as keyof typeof SFDCType2SQL]}`).join(',')})`).run()
      
      upsertSync.run({$sobject_name: sobjdef.name, $sfdc_definition: JSON.stringify(sobjdef), $sql_definition: '', $status: SYNC_MODE.PULL})

      return <TxtResponse assistantMessage={<div>Successfully set sObject {sObject} to sync</div>} />
      
    } catch (error) {
      return <TxtResponse assistantMessage={<div>Failed to process {sObject}: {JSON.stringify(error)}</div>} />
    }

  }, {
    params: t.Object({
      sObject: t.String(),
      mode: t.String((s: string) => ['describe', 'sync', 'query'].includes(s))
    })
  })
  .get('/test', async () => {
    return <div>test</div>
  })
  .get('/monitor', async () => {
    const processid = '' + new Date().getTime()
      const scrollWorkaround = { 'hx-on:htmx:sse-message' : `document.getElementById('messages').scrollIntoView(false)`}
      return <TxtResponse assistantMessage={
          <div id={`sse-response${processid}`} hx-ext="sse" sse-connect={`/monitor/${processid}`} sse-swap={processid} hx-swap="innerHTML" hx-target={`find #stream${processid}`} {...scrollWorkaround}>
              <div sse-swap={`close${processid}`} hx-swap="outerHTML"  hx-target={`closest #sse-response${processid}`}></div>
              <div style="width: fit-content;" id={`stream${processid}`}></div>
          </div>
      } /> 
   })
  .get('/monitor/:processid', async ({params: { processid },  store: {sfdc_auth}}) => new Stream(async (stream) => {

    var messages = ''
    var log = (msg:string, end = false) => { messages += <div>{msg}</div>; if (end) stream.event = `close${processid}`; stream.send(messages)}

    log ('Starting syncing...')

    try {
      const connection = getConnection.get({$name: azheroku_domain})
      if (!connection) return log('no connection found', true)
      const sfdc_auth = JSON.parse(connection.auth) as SFDC_Auth

      const syncs = queryAllSync.all(null)
      for (const sync of syncs) {
        log (`Checking ${sync.sobject_name}..`)
        
        if (sync.status === SYNC_MODE.PULL) {
          log (`Syncing ${sync.sobject_name}..`)
          const sobjdef = JSON.parse(sync.sfdc_definition) as SFDC_SOBJECT_DEFINITION
          log (`Fetching Data ${sync.sobject_name}..`)
          const qresponse = await fetch(`${sfdc_auth.instance_url}/services/data/v54.0/query?q=select+${sobjdef.fields.map(f => f.name).join(',')}+from+${sobjdef.name}`, { headers: {
              'Authorization': `Bearer ${sfdc_auth.access_token}` }
          })
          const sobjdata = await qresponse.json()
          log (`Fetched ${sobjdata.totalSize} records for ${sync.sobject_name}..(done=${sobjdata.done})`)
          
          //const values = [...Array(sobjdata.totalSize).keys()].map(i =>  `(${sobjdef.fields.map(f => `$${f.name}${i}`).join(',')})`).join(',')
          //const upsertStmt = `INSERT INTO ${sync.sobject_name} (${sobjdef.fields.map(f => f.name).join(',')}) VALUES  ${values} ON CONFLICT(Id) DO UPDATE SET (${sobjdef.fields.map(f => `${f.name}=$${f.name}`).join(',')}`
          const upsertStmt = db.prepare(`INSERT INTO ${sync.sobject_name} (${sobjdef.fields.map(f => f.name).join(',')}) VALUES  (${sobjdef.fields.map(f => `$${f.name}`).join(',')}) ON CONFLICT(Id) DO UPDATE SET (${sobjdef.fields.map(f => `${f.name}=$${f.name}`).join(',')}`)
          
          const insertBulk = db.transaction(records => {
            for (const record of records) upsertStmt.run(record);
          });

          const count = insertBulk(sobjdata.records);
          
          console.log(`Inserted ${count} cats`);

          //const bindings = sobjdata.records.map((r: any,idx: number) => sobjdef.fields.reduce((facc, fld) => { return  {...facc, [`$${fld.name}${idx}`]: r[fld.name]}}, {})).reduce((acc: any,a: any) => { return {...acc, ...a}}, {})
          //log (bindings)
          //db.query(upsertStmt).run(bindings)
          log (`Inserted ${sobjdata.totalSize} records into ${sync.sobject_name})`)
        }
        log (`Done`, true)
      }
    } catch (error) {
      log (`Failed to sync ${azheroku_domain}: ${JSON.stringify(error)}`, true)
    }
  }, { event: processid }), {
    params: t.Object({
      processid: t.String()
    })
  })

  // https://help.salesforce.com/s/articleView?id=sf.remoteaccess_oauth_web_server_flow.htm&type=5
  .post('/api/input',({set}) => 
    <div>Implement</div>
  )
  //http://localhost:3000/oauth2/callback?code=aPrx4YhZ2USTqwx22vro2QGjsvWDv2Cx8SB11UAqNTDORyS6BvMfSgRKxqk6ukFCzBcIHhCIsQ%3D%3D
  .get('/oauth2/callback', async ({ set, query: {code}, store}) => {
    try {
      const response = await fetch( `https://${azheroku_domain}/services/oauth2/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code,
          client_id: azheroku_consumer_key,
          client_secret: azheroku_consumer_secret,
          redirect_uri: azheroku_callback_url
        })
      })

      store.sfdc_auth = await response.json() as SFDC_Auth
      upsertConnection.run({$name: azheroku_domain, $auth: JSON.stringify(store.sfdc_auth), $mode: SYNC_MODE.NONE})
      set.redirect ='/?sfdc_auth_redirect=true'
      
    } catch (error) {
      return <Page title="AzSalesforceConnect"><div>Failed to login {JSON.stringify(error)}</div></Page>
    }
  }, {
    query: t.Object({
        code: t.String()
    })
})
  
  .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);


setInterval(async () => {
  
}
, 1000 * 30 * 1) // 30 seconds minutes
