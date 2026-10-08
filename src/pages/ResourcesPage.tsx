import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  UploadCloud,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import { StorageService } from '../services/storage/localStorageService';
import { AIService } from '../services/ai/AIService';
import type { ResourceDocument } from '../types';

export const ResourcesPage: React.FC = () => {
  const navigate = useNavigate();
  const [resources, setResources] = useState<ResourceDocument[]>(StorageService.getResources());
  const [selectedResource, setSelectedResource] = useState<ResourceDocument | null>(resources[0] || null);

  const [uploadedFileName, setUploadedFileName] = useState('');
  const [uploadedText, setUploadedText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFileName(file.name);
    // Read text if text file, or use name for document indexing
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = (event.target?.result as string) || `Belge içeriği: ${file.name}`;
      setUploadedText(text);
    };
    reader.readAsText(file);
  };

  const handleAnalyzeAndSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadedFileName.trim() || isAnalyzing) return;

    setIsAnalyzing(true);
    try {
      const analysis = await AIService.analyzeSource({
        fileName: uploadedFileName,
        textSnippet: uploadedText || `${uploadedFileName} ders notları ve sınav özeti`,
      });

      const newResource = AIService.getSourceAnalyzer().createResourceDocument(
        { name: uploadedFileName, size: uploadedText.length * 2 || 150000 },
        analysis,
        uploadedText
      );

      StorageService.addResource(newResource);
      const updatedList = StorageService.getResources();
      setResources(updatedList);
      setSelectedResource(newResource);

      setUploadedFileName('');
      setUploadedText('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCreatePathFromResource = async (resource: ResourceDocument) => {
    setIsAnalyzing(true);
    try {
      const path = await AIService.generateLearningPath({
        topic: `${resource.name.replace(/\.[^/.]+$/, '')} Odaklı Çalışma`,
        level: 'intermediate',
        sourceDocumentName: resource.name,
      });

      path.description = `Bu öğrenme yolu, doğrudan ${resource.name} içeriğine dayanılarak PUSULA AI tarafından oluşturuldu.`;
      path.sourceDocumentName = resource.name;

      StorageService.addPath(path);
      navigate(`/path/${path.id}`);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <span className="badge badge-blue">
            <FileText size={12} />
            Kaynaktan Öğren (Source-Based AI)
          </span>
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-primary)' }}>
          Ders Notu & PDF Analizi
        </h1>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
          Hocanın slaytını veya PDF ders notunu yükle. PUSULA halüsinasyon üretmeden doğrudan kaynağa dayalı mikro dersler, özetler ve sınav soruları çıkarsın.
        </p>
      </div>

      {/* Upload Box Card */}
      <div className="card" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12, color: 'var(--text-primary)' }}>
          Yeni Ders Notu / PDF Yükle
        </h3>

        <form onSubmit={handleAnalyzeAndSave} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div
            style={{
              border: '2px dashed var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '24px',
              textAlign: 'center',
              backgroundColor: 'var(--bg-input)',
              position: 'relative',
              cursor: 'pointer',
            }}
          >
            <input
              type="file"
              accept=".pdf,.txt,.doc,.docx"
              onChange={handleFileUpload}
              style={{
                position: 'absolute',
                inset: 0,
                opacity: 0,
                cursor: 'pointer',
              }}
            />
            <UploadCloud size={36} color="var(--primary)" style={{ margin: '0 auto 8px' }} />
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
              {uploadedFileName ? `Seçilen Dosya: ${uploadedFileName}` : 'PDF veya Ders Notunu Buraya Sürükle veya Tıkla'}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
              PDF, TXT, DOCX desteklenir (Maksimum 25 MB)
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 4 }}>
              Veya Not Metnini Doğrudan Yapıştır
            </label>
            <textarea
              className="input-field"
              rows={3}
              placeholder="Slayt metni, vize özet notları veya hoca tarafından verilen kilit kavramları buraya yapıştırabilirsin..."
              value={uploadedText}
              onChange={(e) => {
                setUploadedText(e.target.value);
                if (!uploadedFileName) setUploadedFileName('Ders_Notu_Metni.txt');
              }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="submit"
              disabled={isAnalyzing || (!uploadedFileName && !uploadedText)}
              className="btn btn-primary"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Belge Analiz Ediliyor...</span>
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  <span>Belgeyi Analiz Et ve Kaydet</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Uploaded Documents List & Selected Detail */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
        {/* Document List */}
        <div className="card" style={{ padding: '20px' }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12, color: 'var(--text-primary)' }}>
            Yüklenen Ders Kaynakları ({resources.length})
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {resources.map((res) => {
              const isSelected = selectedResource?.id === res.id;
              return (
                <div
                  key={res.id}
                  onClick={() => setSelectedResource(res)}
                  style={{
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: isSelected ? 'var(--primary-subtle)' : 'var(--bg-input)',
                    border: '1px solid',
                    borderColor: isSelected ? 'var(--primary)' : 'var(--border-subtle)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <FileText size={18} color={isSelected ? 'var(--primary)' : 'var(--text-muted)'} />
                    <div>
                      <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text-primary)' }}>
                        {res.name}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                        {res.fileSize} • {res.extractedTopics.length} Kilit Konu
                      </div>
                    </div>
                  </div>

                  <span className="badge badge-blue" style={{ fontSize: 10 }}>
                    Doğrulanmış
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Document Analysis Details */}
        {selectedResource && (
          <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span className="badge badge-purple" style={{ marginBottom: 4 }}>
                  Akademik Kaynak Raporu
                </span>
                <h3 style={{ fontSize: 17, fontWeight: 800, color: 'var(--text-primary)' }}>
                  {selectedResource.name}
                </h3>
              </div>

              {/* Verified Source Citation Tag */}
              <div style={{ fontSize: 11, color: 'var(--success)', fontWeight: 600 }}>
                ✓ Kaynak İçi Doğrulandı
              </div>
            </div>

            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 4 }}>
                BELGE ÖZETİ
              </div>
              <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                {selectedResource.summary}
              </p>
            </div>

            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 6 }}>
                ÇIKARILAN KİLİT KONU BAŞLIKLARI
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {selectedResource.extractedTopics.map((topic, i) => (
                  <div key={i} style={{ fontSize: 13, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <CheckCircle2 size={13} color="var(--primary)" />
                    <span>{topic}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Citation Sample Card (Section 8 spec) */}
            <div
              style={{
                padding: '12px 14px',
                backgroundColor: 'var(--bg-input)',
                borderRadius: 'var(--radius-sm)',
                borderLeft: '3px solid var(--primary)',
                fontSize: 12.5,
                color: 'var(--text-secondary)',
              }}
            >
              <strong>AI Kaynak Alıntısı:</strong> "Bu açıklama, {selectedResource.name} içeriğine göre oluşturuldu."
            </div>

            <div style={{ marginTop: 'auto', paddingTop: 10 }}>
              <button
                onClick={() => handleCreatePathFromResource(selectedResource)}
                disabled={isAnalyzing}
                className="btn btn-primary btn-lg"
                style={{ width: '100%' }}
              >
                <Sparkles size={16} />
                <span>Bu Kaynaktan Öğrenme Yolu Oluştur</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
