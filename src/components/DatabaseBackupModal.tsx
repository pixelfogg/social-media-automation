import React, { useRef, useState } from 'react';
import type { Client } from '../types';
import { getClients, saveClients, resetToDefaultSeed } from '../services/db';
import { 
  Database, 
  Download, 
  Upload, 
  RotateCcw, 
  CheckCircle2, 
  FileJson,
  X
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface DatabaseBackupModalProps {
  onClose: () => void;
  onRefreshWorkspace: () => void;
}

export const DatabaseBackupModal: React.FC<DatabaseBackupModalProps> = ({
  onClose,
  onRefreshWorkspace
}) => {
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExportDatabase = () => {
    const clients = getClients();
    const backupObject = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      platform: 'SocialPulse AI SaaS',
      clients
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupObject, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `socialpulse_ai_database_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    document.body.removeChild(downloadAnchor);

    setStatusMessage('✅ Exported full JSON database backup successfully!');
  };

  const handleImportDatabaseFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);
        const importedClients: Client[] = Array.isArray(parsed) ? parsed : (parsed.clients || []);

        if (importedClients.length > 0) {
          saveClients(importedClients);
          setStatusMessage(`✅ Restored ${importedClients.length} client workspaces from backup!`);
          confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
          setTimeout(() => {
            onRefreshWorkspace();
            onClose();
          }, 1200);
        } else {
          setStatusMessage('⚠️ Invalid JSON backup format.');
        }
      } catch (err) {
        setStatusMessage('❌ Failed to parse JSON file.');
      }
    };
    reader.readAsText(file);
  };

  const handleResetToSeedData = () => {
    const seeded = resetToDefaultSeed();
    setStatusMessage(`✅ Reset database to initial seed state (${seeded.length} clients).`);
    confetti({ particleCount: 60, spread: 50, origin: { y: 0.6 } });
    setTimeout(() => {
      onRefreshWorkspace();
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#141416] border border-[#26262a] rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl">
        
        <div className="flex items-center justify-between border-b border-[#26262a] pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-[#00d4a4]/10 text-[#00d4a4] rounded-lg border border-[#00d4a4]/20">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Database Backup & Import Manager</h3>
              <p className="text-xs text-neutral-400">Export complete workspace state or restore JSON database backup</p>
            </div>
          </div>
          <button onClick={onClose} className="text-neutral-400 hover:text-white font-bold text-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {statusMessage && (
          <div className="bg-[#0a0a0a] border border-[#00d4a4]/40 rounded-xl p-3 text-xs text-[#00d4a4] font-mono-code flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-[#00d4a4]" />
            <span>{statusMessage}</span>
          </div>
        )}

        <div className="space-y-3">
          <div className="bg-[#0a0a0a] border border-[#26262a] rounded-xl p-4 flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                <FileJson className="w-4 h-4 text-[#00d4a4]" />
                Export Full JSON Backup
              </h4>
              <p className="text-[11px] text-neutral-400 mt-0.5">Download all clients, brand guides, tokens, and 30-day calendars.</p>
            </div>

            <button
              onClick={handleExportDatabase}
              className="btn-mint px-4 py-2 text-xs font-bold flex items-center space-x-1.5 shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export JSON</span>
            </button>
          </div>

          <div className="bg-[#0a0a0a] border border-[#26262a] rounded-xl p-4 flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                <Upload className="w-4 h-4 text-[#00d4a4]" />
                Import JSON Backup File
              </h4>
              <p className="text-[11px] text-neutral-400 mt-0.5">Restore database state from a previously exported `.json` file.</p>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              accept=".json"
              onChange={handleImportDatabaseFile}
              className="hidden"
            />

            <button
              onClick={() => fileInputRef.current?.click()}
              className="btn-pill-dark px-4 py-2 text-xs font-bold flex items-center space-x-1.5"
            >
              <Upload className="w-3.5 h-3.5 text-[#00d4a4]" />
              <span>Import File</span>
            </button>
          </div>

          <div className="bg-[#0a0a0a] border border-[#26262a] rounded-xl p-4 flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                <RotateCcw className="w-4 h-4 text-amber-400" />
                Reset Database to Initial Seeds
              </h4>
              <p className="text-[11px] text-neutral-400 mt-0.5">Re-populate local storage with default seeded agency clients.</p>
            </div>

            <button
              onClick={handleResetToSeedData}
              className="px-3.5 py-2 text-xs font-bold rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/30 hover:bg-amber-500/20"
            >
              Reset Database
            </button>
          </div>
        </div>

        <div className="pt-3 border-t border-[#26262a] flex justify-end">
          <button onClick={onClose} className="btn-pill-dark px-5 py-1.5 text-xs font-semibold">
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
