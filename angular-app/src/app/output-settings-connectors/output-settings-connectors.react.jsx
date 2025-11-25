import { useMemo, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Mail, HardDrive, Cloud, Globe, Database, FolderSync, PlugZap, Share2, ServerCog, ShieldCheck, TestTube2, KeyRound, Webhook, FileJson, FileSpreadsheet, Send } from "lucide-react";

// Canonical connector types & slugs
const CONNECTOR_TYPES = [
  { slug: "email_smtp", label: "Email (SMTP)", icon: Mail },
  { slug: "email_graph", label: "Email (Outlook Graph)", icon: Mail },
  { slug: "http_post", label: "HTTP POST (API)", icon: Globe },
  { slug: "webhook", label: "Webhook Receiver", icon: Webhook },
  { slug: "local_fs", label: "Local / Network Drive", icon: HardDrive },
  { slug: "s3_sink", label: "Amazon S3", icon: Cloud },
  { slug: "azure_blob", label: "Azure Blob Storage", icon: Cloud },
  { slug: "gdrive", label: "Google Drive", icon: FolderSync },
  { slug: "sharepoint", label: "SharePoint", icon: Share2 },
  { slug: "sftp_sink", label: "SFTP", icon: ServerCog },
  { slug: "kafka_topic", label: "Kafka Topic", icon: PlugZap },
  { slug: "postgres", label: "PostgreSQL", icon: Database },
  { slug: "snowflake", label: "Snowflake", icon: Database },
];

// Demo rows for the table
const demoConnectors = [
  { id: "CN-001", name: "Finance Email", type: "email_smtp", status: "enabled", lastRun: "2025-10-18 11:12", successes: 142, failures: 2 },
  { id: "CN-002", name: "ERP Webhook", type: "http_post", status: "enabled", lastRun: "2025-10-18 10:58", successes: 340, failures: 12 },
  { id: "CN-003", name: "Local Archive", type: "local_fs", status: "disabled", lastRun: "2025-10-17 19:21", successes: 980, failures: 0 },
];

export default function OutputConnectorsPage() {
  const [selectedType, setSelectedType] = useState("email_smtp");
  const [name, setName] = useState("");
  const [enabled, setEnabled] = useState(true);
  const [format, setFormat] = useState("json");
  const [retry, setRetry] = useState(3);
  const [timeout, setTimeoutMs] = useState(15000);
  const [testResult, setTestResult] = useState(null);
  const [rows, setRows] = useState(demoConnectors);

  const selectedMeta = useMemo(() => CONNECTOR_TYPES.find(c => c.slug === selectedType) || CONNECTOR_TYPES[0], [selectedType]);

  const testConnection = () => {
    setTestResult("Testing…");
    setTimeout(() => {
      setTestResult("✅ Connection successful: latency 124ms");
    }, 600);
  };

  const saveConnector = () => {
    if (!name.trim()) {
      alert("Please provide a connector name");
      return;
    }
    const id = `CN-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
    setRows([{ id, name, type: selectedType, status: enabled ? "enabled" : "disabled", lastRun: "—", successes: 0, failures: 0 }, ...rows]);
    setTestResult(null);
    setName("");
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><PlugZap className="text-violet-600"/>Output Connectors</h1>
          <p className="text-sm text-muted-foreground">Deliver parsed outputs to email, APIs, storage and more</p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <ShieldCheck className="w-4 h-4 text-emerald-600"/>
          <span>Encrypted at rest • Role-based access</span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* New Connector Wizard */}
        <Card className="rounded-2xl xl:col-span-1">
          <CardHeader>
            <CardTitle>Create Connector</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Type</Label>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select connector type" />
                </SelectTrigger>
                <SelectContent>
                  {CONNECTOR_TYPES.map(t => (
                    <SelectItem key={t.slug} value={t.slug}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Name</Label>
              <Input placeholder="e.g., Finance Email, ERP Webhook" value={name} onChange={(e)=>setName(e.target.value)} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex items-center justify-between border rounded-xl px-3 py-2">
                <Label className="font-medium">Enabled</Label>
                <Switch checked={enabled} onCheckedChange={setEnabled} />
              </div>
              <div>
                <Label>Output Format</Label>
                <Select value={format} onValueChange={setFormat}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Format"/></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="json">JSON</SelectItem>
                    <SelectItem value="csv">CSV</SelectItem>
                    <SelectItem value="xlsx">Excel (XLSX)</SelectItem>
                    <SelectItem value="xml">XML</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Dynamic Config Forms */}
            {selectedType === "email_smtp" && (
              <div className="space-y-2 border rounded-2xl p-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div>
                    <Label>SMTP Host</Label>
                    <Input placeholder="smtp.example.com" />
                  </div>
                  <div>
                    <Label>Port</Label>
                    <Input placeholder="587" defaultValue="587" />
                  </div>
                  <div>
                    <Label>Username</Label>
                    <Input placeholder="service@company.com" />
                  </div>
                  <div>
                    <Label>Password / App Token</Label>
                    <Input type="password" placeholder="••••••••" />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div>
                    <Label>From</Label>
                    <Input placeholder="glyphx@company.com" />
                  </div>
                  <div>
                    <Label>To</Label>
                    <Input placeholder="ap-team@company.com, finance@company.com" />
                  </div>
                </div>
                <div>
                  <Label>Subject Template</Label>
                  <Input placeholder="Glyphx Export — {DocType} {DocId}" />
                </div>
                <div>
                  <Label>Body</Label>
                  <Textarea placeholder={"Hi team,\nSee attached export.\nRegards, Glyphx"} />
                </div>
              </div>
            )}

            {selectedType === "email_graph" && (
              <div className="space-y-2 border rounded-2xl p-3">
                <p className="text-sm text-muted-foreground">Authenticate with Microsoft Graph OAuth; we store refresh tokens securely.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div>
                    <Label>Tenant ID</Label>
                    <Input placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" />
                  </div>
                  <div>
                    <Label>Client ID</Label>
                    <Input placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" />
                  </div>
                </div>
                <Button variant="outline" className="w-full">Connect Microsoft Account</Button>
              </div>
            )}

            {selectedType === "http_post" && (
              <div className="space-y-2 border rounded-2xl p-3">
                <div>
                  <Label>Endpoint URL</Label>
                  <Input placeholder="https://api.example.com/webhooks/glyphx" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div>
                    <Label>Method</Label>
                    <Select defaultValue="POST">
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="POST">POST</SelectItem>
                        <SelectItem value="PUT">PUT</SelectItem>
                        <SelectItem value="PATCH">PATCH</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Auth</Label>
                    <Select defaultValue="none">
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        <SelectItem value="bearer">Bearer Token</SelectItem>
                        <SelectItem value="basic">Basic Auth</SelectItem>
                        <SelectItem value="api_key">API Key (header)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label>Headers (JSON)</Label>
                  <Textarea placeholder='{"X-API-Key": "..."}' />
                </div>
                <div>
                  <Label>Body Template</Label>
                  <Textarea placeholder='{"docId":"{DocId}","docType":"{DocType}","payload":{Payload}}' />
                </div>
              </div>
            )}

            {selectedType === "local_fs" && (
              <div className="space-y-2 border rounded-2xl p-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div>
                    <Label>Path</Label>
                    <Input placeholder="/mnt/exports" />
                  </div>
                  <div>
                    <Label>File Pattern</Label>
                    <Input placeholder="{DocType}_{DocId}_{yyyyMMdd}.json" />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">Supports local and SMB paths (e.g., \\\\NAS01\\exports)</p>
              </div>
            )}

            {selectedType === "s3_sink" && (
              <div className="space-y-2 border rounded-2xl p-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div>
                    <Label>Bucket</Label>
                    <Input placeholder="glyphx-exports" />
                  </div>
                  <div>
                    <Label>Region</Label>
                    <Input placeholder="ap-southeast-1" />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div>
                    <Label>Access Key</Label>
                    <Input placeholder="AKIAXXXXX" />
                  </div>
                  <div>
                    <Label>Secret Key</Label>
                    <Input type="password" placeholder="••••••••" />
                  </div>
                </div>
                <div>
                  <Label>Key Prefix</Label>
                  <Input placeholder="exports/{DocType}/" />
                </div>
              </div>
            )}

            {selectedType === "azure_blob" && (
              <div className="space-y-2 border rounded-2xl p-3">
                <div>
                  <Label>Connection String</Label>
                  <Input placeholder="DefaultEndpointsProtocol=https;AccountName=..." />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div>
                    <Label>Container</Label>
                    <Input placeholder="glyphx-exports" />
                  </div>
                  <div>
                    <Label>Prefix</Label>
                    <Input placeholder="exports/{DocType}/" />
                  </div>
                </div>
              </div>
            )}

            {selectedType === "gdrive" && (
              <div className="space-y-2 border rounded-2xl p-3">
                <p className="text-sm text-muted-foreground">Connect your Google account and choose the destination folder.</p>
                <Button variant="outline" className="w-full">Connect Google Drive</Button>
                <div>
                  <Label>Folder ID / Path</Label>
                  <Input placeholder="/Glyphx/Exports" />
                </div>
              </div>
            )}

            {selectedType === "sharepoint" && (
              <div className="space-y-2 border rounded-2xl p-3">
                <div>
                  <Label>Site URL</Label>
                  <Input placeholder="https://contoso.sharepoint.com/sites/ops" />
                </div>
                <div>
                  <Label>Library / Folder</Label>
                  <Input placeholder="Shared Documents/Exports" />
                </div>
              </div>
            )}

            {selectedType === "sftp_sink" && (
              <div className="space-y-2 border rounded-2xl p-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div>
                    <Label>Host</Label>
                    <Input placeholder="sftp.example.com" />
                  </div>
                  <div>
                    <Label>Port</Label>
                    <Input placeholder="22" defaultValue="22" />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div>
                    <Label>Username</Label>
                    <Input placeholder="glyphx" />
                  </div>
                  <div>
                    <Label>Password / Private Key</Label>
                    <Input type="password" placeholder="••••••••" />
                  </div>
                </div>
                <div>
                  <Label>Remote Path</Label>
                  <Input placeholder="/exports/{DocType}/" />
                </div>
              </div>
            )}

            {selectedType === "kafka_topic" && (
              <div className="space-y-2 border rounded-2xl p-3">
                <div>
                  <Label>Bootstrap Servers</Label>
                  <Input placeholder="kafka1:9092,kafka2:9092" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div>
                    <Label>Topic</Label>
                    <Input placeholder="glyphx.exports" />
                  </div>
                  <div>
                    <Label>Acks</Label>
                    <Select defaultValue="all">
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">0</SelectItem>
                        <SelectItem value="1">1</SelectItem>
                        <SelectItem value="all">all</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            {selectedType === "postgres" && (
              <div className="space-y-2 border rounded-2xl p-3">
                <div>
                  <Label>Connection URI</Label>
                  <Input placeholder="postgres://user:pass@host:5432/db" />
                </div>
                <div>
                  <Label>Table</Label>
                  <Input placeholder="public.glyphx_exports" />
                </div>
                <div>
                  <Label>Insert Mode</Label>
                  <Select defaultValue="upsert">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="insert">Insert</SelectItem>
                      <SelectItem value="upsert">Upsert (on conflict)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {selectedType === "snowflake" && (
              <div className="space-y-2 border rounded-2xl p-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div>
                    <Label>Account</Label>
                    <Input placeholder="xy12345.ap-southeast-1" />
                  </div>
                  <div>
                    <Label>Warehouse</Label>
                    <Input placeholder="COMPUTE_WH" />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div>
                    <Label>User</Label>
                    <Input placeholder="GLYPHX" />
                  </div>
                  <div>
                    <Label>Password / Key</Label>
                    <Input type="password" placeholder="••••••••" />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div>
                    <Label>Database.Schema</Label>
                    <Input placeholder="OPS.EXPORTS" />
                  </div>
                  <div>
                    <Label>Table</Label>
                    <Input placeholder="DU_OUTPUTS" />
                  </div>
                </div>
              </div>
            )}

            <Separator />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <Label>Retries</Label>
                <Input type="number" min={0} max={10} value={retry} onChange={(e)=>setRetry(parseInt(e.target.value||"0"))} />
              </div>
              <div>
                <Label>Timeout (ms)</Label>
                <Input type="number" min={1000} step={500} value={timeout} onChange={(e)=>setTimeoutMs(parseInt(e.target.value||"0"))} />
              </div>
              <div className="flex items-end">
                <Button className="w-full" variant="outline" onClick={testConnection}><TestTube2 className="w-4 h-4 mr-2"/>Test Connection</Button>
              </div>
            </div>
            {testResult && <p className="text-xs text-muted-foreground">{testResult}</p>}

            <div className="flex gap-2">
              <Button onClick={saveConnector}><Send className="w-4 h-4 mr-1"/>Save Connector</Button>
              <Button variant="outline">Cancel</Button>
            </div>
          </CardContent>
        </Card>

        {/* Right Side: Inventory & Routing */}
        <Card className="rounded-2xl xl:col-span-2">
          <CardHeader>
            <CardTitle>Configured Connectors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-muted-foreground">
                  <tr>
                    <th className="py-2">Name</th>
                    <th className="py-2">Type</th>
                    <th className="py-2">Status</th>
                    <th className="py-2">Last Run</th>
                    <th className="py-2">Success</th>
                    <th className="py-2">Fail</th>
                    <th className="py-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map(r => {
                    const meta = CONNECTOR_TYPES.find(c => c.slug === r.type) || CONNECTOR_TYPES[0];
                    const Icon = meta.icon;
                    return (
                      <tr key={r.id} className="border-t">
                        <td className="py-2 font-medium">{r.name}</td>
                        <td className="py-2 flex items-center gap-2"><Icon className="w-4 h-4"/>{meta.label}</td>
                        <td className="py-2"><Badge variant={r.status === 'enabled' ? 'default' : 'secondary'}>{r.status}</Badge></td>
                        <td className="py-2">{r.lastRun}</td>
                        <td className="py-2">{r.successes}</td>
                        <td className="py-2">{r.failures}</td>
                        <td className="py-2 text-right">
                          <div className="flex justify-end gap-2">
                            <Button size="sm" variant="outline">Disable</Button>
                            <Button size="sm" variant="outline">Edit</Button>
                            <Button size="sm">Run Now</Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <Separator className="my-4"/>

            <CardTitle className="mb-3">Routing Rules</CardTitle>
            <p className="text-xs text-muted-foreground mb-3">Send different document types to different connectors.</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="flex items-center gap-2 border rounded-xl px-3 py-2">
                <Label className="min-w-[80px]">Invoices</Label>
                <Select defaultValue="email_smtp">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CONNECTOR_TYPES.map(t => <SelectItem key={t.slug} value={t.slug}>{t.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2 border rounded-xl px-3 py-2">
                <Label className="min-w-[80px]">POs</Label>
                <Select defaultValue="http_post">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CONNECTOR_TYPES.map(t => <SelectItem key={t.slug} value={t.slug}>{t.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2 border rounded-xl px-3 py-2">
                <Label className="min-w-[80px]">Receipts</Label>
                <Select defaultValue="local_fs">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CONNECTOR_TYPES.map(t => <SelectItem key={t.slug} value={t.slug}>{t.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
