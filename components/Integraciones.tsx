'use client';

import { useState } from 'react';
import { FileSpreadsheet, RadioTower, QrCode, Copy, CheckCircle2 } from 'lucide-react';

export default function Integraciones() {
  const [qr, setQr] = useState<any>(null);
  const [syncStatus, setSyncStatus] = useState('');
  const [iotPayload, setIotPayload] = useState('');

  const generarQR = async () => {
    const url = '/api/qr/bandeja?ciclo=C1&lote=MB-AB-001&bandeja=B-001&estante=E1';
    const res = await fetch(url);
    const data = await res.json();
    setQr(data);
  };

  const syncSheets = async () => {
    setSyncStatus('Sincronizando...');
    const res = await fetch('/api/google-sheets/sync', { method: 'POST' });
    const data = await res.json();
    setSyncStatus(data.ok ? 'Sincronización enviada.' : data.error || 'No se pudo sincronizar.');
  };

  const verPayloadIoT = () => {
    setIotPayload(JSON.stringify({
      fase: 'fructificacion',
      temperatura_aire: 17.2,
      temperatura_compost: 18.1,
      humedad: 92,
      co2: 1250,
      device_id: 'esp32-mhz19-01',
      bandeja_id: 'B-001',
      notas: 'Lectura ESP32 + MH-Z19',
    }, null, 2));
  };

  return (
    <div className="space-y-6">
      <header>
        <div className="text-xs uppercase tracking-widest text-bosque-700 mb-2">Fase 4</div>
        <h1 className="font-serif text-4xl text-tierra-900 mb-2">Integraciones avanzadas</h1>
        <p className="text-tierra-600">Google Sheets, sensores IoT y QR de trazabilidad por bandeja.</p>
      </header>

      <div className="grid lg:grid-cols-3 gap-5">
        <div className="mb-card p-6">
          <FileSpreadsheet className="w-8 h-8 text-bosque-700 mb-4" />
          <h3 className="font-serif text-xl text-tierra-900 mb-2">Google Sheets</h3>
          <p className="text-sm text-tierra-600 mb-4">Envía datos operativos a un webhook de Google Apps Script.</p>
          <button onClick={syncSheets} className="mb-button-primary w-full">Sincronizar ahora</button>
          {syncStatus && <p className="text-sm text-tierra-600 mt-3">{syncStatus}</p>}
        </div>

        <div className="mb-card p-6">
          <RadioTower className="w-8 h-8 text-bosque-700 mb-4" />
          <h3 className="font-serif text-xl text-tierra-900 mb-2">API IoT</h3>
          <p className="text-sm text-tierra-600 mb-4">Endpoint para ESP32 + sensor MH-Z19.</p>
          <button onClick={verPayloadIoT} className="mb-button-gold w-full">Ver payload ejemplo</button>
          {iotPayload && <pre className="mt-3 text-xs bg-tierra-950 text-micelio-50 p-3 rounded-xl overflow-x-auto">{iotPayload}</pre>}
        </div>

        <div className="mb-card p-6">
          <QrCode className="w-8 h-8 text-bosque-700 mb-4" />
          <h3 className="font-serif text-xl text-tierra-900 mb-2">QR por bandeja</h3>
          <p className="text-sm text-tierra-600 mb-4">Genera URL de trazabilidad por ciclo, lote y bandeja.</p>
          <button onClick={generarQR} className="mb-button-primary w-full">Generar QR demo</button>
          {qr && (
            <div className="mt-4 space-y-3">
              <img src={qr.qr_api_url} alt="QR trazabilidad" className="w-40 h-40 rounded-xl border border-micelio-200 bg-white p-2" />
              <button onClick={() => navigator.clipboard.writeText(qr.payload.url)} className="inline-flex items-center gap-2 text-xs text-bosque-700 underline">
                <Copy className="w-3 h-3" /> Copiar URL
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="mb-card p-6">
        <h2 className="font-serif text-2xl text-tierra-900 mb-4">Endpoints</h2>
        <div className="grid md:grid-cols-3 gap-3 text-sm">
          <Endpoint method="POST" path="/api/google-sheets/sync" />
          <Endpoint method="POST" path="/api/iot/ingest" />
          <Endpoint method="GET" path="/api/qr/bandeja" />
        </div>
      </div>
    </div>
  );
}

function Endpoint({ method, path }: { method: string; path: string }) {
  return (
    <div className="bg-micelio-50 border border-micelio-200 rounded-xl p-3">
      <div className="flex items-center gap-2 text-bosque-700 mb-1">
        <CheckCircle2 className="w-4 h-4" />
        <span className="text-xs uppercase tracking-wider">{method}</span>
      </div>
      <code className="text-xs text-tierra-800">{path}</code>
    </div>
  );
}
