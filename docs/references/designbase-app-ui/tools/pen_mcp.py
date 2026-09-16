import signal; signal.alarm(60)
import json, subprocess, sys, itertools
CMD=["/Applications/Pen.app/Contents/Resources/app.asar.unpacked/out/mcp-server-darwin-arm64","--app","desktop","--agent","claudeCodeCLI"]
class MCP:
    def __init__(s):
        s.p=subprocess.Popen(CMD,stdin=subprocess.PIPE,stdout=subprocess.PIPE,stderr=subprocess.PIPE,text=True)
        s.i=itertools.count(1)
        s.call_raw("initialize",{"protocolVersion":"2025-06-18","capabilities":{},"clientInfo":{"name":"itinova-script","version":"0"}})
        s.p.stdin.write(json.dumps({"jsonrpc":"2.0","method":"notifications/initialized"})+"\n"); s.p.stdin.flush()
    def call_raw(s,method,params):
        rid=next(s.i)
        s.p.stdin.write(json.dumps({"jsonrpc":"2.0","id":rid,"method":method,"params":params})+"\n"); s.p.stdin.flush()
        while True:
            line=s.p.stdout.readline()
            if not line: raise SystemExit("server closed: "+s.p.stderr.read()[:2000])
            try: m=json.loads(line)
            except: continue
            if m.get("id")==rid: return m
    def tool(s,name,args):
        r=s.call_raw("tools/call",{"name":name,"arguments":args})
        if "error" in r: return r
        return r["result"]
if __name__ == "__main__":
    m=MCP()
    r=m.call_raw("tools/list",{})
    for t in r["result"]["tools"]: print(t["name"],"—",t.get("description","")[:160].replace("\n"," "))
    print(json.dumps([t["inputSchema"] for t in r["result"]["tools"]])[:3000])
