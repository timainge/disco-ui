import React, { useState } from 'react';
import { Lock, X, Plus, FolderInput } from 'lucide-react';
import { useDocumentDetail, useCategories, useSubmitReview, useAddNote, useAddTag, useRemoveTag, useMoveCategory } from '@/hooks/queries';
import { useStore } from '@/store/useStore';

export function MetadataPanel() {
  const selectedDocId = useStore(state => state.selectedDocId);
  const { data: docDetail } = useDocumentDetail(selectedDocId);
  const { data: categories } = useCategories();
  const submitReview = useSubmitReview();
  const addNote = useAddNote();
  const addTag = useAddTag();
  const removeTag = useRemoveTag();
  const moveCategory = useMoveCategory();

  const [noteText, setNoteText] = useState('');
  const [tagText, setTagText] = useState('');
  const [isMovingCategory, setIsMovingCategory] = useState(false);

  const handleDecisionChange = (decision: string) => {
    if (!selectedDocId) return;
    submitReview.mutate({ id: selectedDocId, decision });
  };

  const handleAddNote = () => {
    if (!selectedDocId || !noteText.trim()) return;
    addNote.mutate({ id: selectedDocId, note: noteText.trim() });
    setNoteText('');
  };

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && selectedDocId && tagText.trim()) {
      addTag.mutate({ id: selectedDocId, tag: tagText.trim() });
      setTagText('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    if (!selectedDocId) return;
    removeTag.mutate({ id: selectedDocId, tag });
  };

  const handleMoveCategory = (categoryId: string) => {
    if (!selectedDocId) return;
    moveCategory.mutate({ id: selectedDocId, categoryId });
    setIsMovingCategory(false);
  };

  if (!docDetail) {
    return (
      <div className="h-full w-full border-l border-border bg-card flex flex-col overflow-y-auto">
        <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm p-6 text-center">
          Select a document to view metadata and coding options
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full border-l border-border bg-card flex flex-col overflow-y-auto">
      <div className="p-5 space-y-8">
        <section>
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3 flex items-center">
            <span className="w-4 h-[1px] bg-border mr-2"></span>
            Document
            <span className="flex-1 h-[1px] bg-border ml-2"></span>
          </h3>
          <div className="text-sm font-mono font-medium mb-4 bg-muted/50 p-2 rounded border border-border inline-block">
            {docDetail.classification?.page_code || 'Uncoded'}
          </div>
          <div className="grid grid-cols-[70px_1fr] gap-y-2 text-sm">
            <div className="text-muted-foreground">Date</div><div>{docDetail.document_date}</div>
            <div className="text-muted-foreground">From</div><div className="truncate" title={docDetail.author || ''}>{docDetail.author}</div>
            <div className="text-muted-foreground">To</div><div className="truncate" title={docDetail.metadata?.to || ''}>{docDetail.metadata?.to}</div>
            <div className="text-muted-foreground">Type</div><div className="capitalize">{docDetail.doc_type}</div>
            <div className="text-muted-foreground">Source</div><div className="capitalize">{docDetail.source}</div>
          </div>
        </section>

        <section>
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3 flex items-center">
            <span className="w-4 h-[1px] bg-border mr-2"></span>
            AI Analysis
            <span className="flex-1 h-[1px] bg-border ml-2"></span>
          </h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1.5">
                <span className="font-medium">Relevance</span>
                <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">{docDetail.classification?.relevance_score}</span>
              </div>
              <div className="h-1.5 bg-accent rounded-full overflow-hidden">
                <div 
                  className={`h-full ${docDetail.classification?.relevance_score && docDetail.classification.relevance_score >= 0.5 ? 'bg-success' : 'bg-muted-foreground'}`} 
                  style={{ width: `${(docDetail.classification?.relevance_score || 0) * 100}%` }}
                />
              </div>
              <p className="text-sm mt-3 italic text-muted-foreground bg-muted/30 p-3 rounded border border-border/50 leading-relaxed">
                "{docDetail.classification?.relevance_explanation}"
              </p>
            </div>
            
            {docDetail.classification?.is_privileged && (
              <div className="bg-warning/10 border border-warning/30 rounded-md p-3 text-sm">
                <div className="font-bold text-warning flex items-center mb-1">
                  <Lock className="w-4 h-4 mr-1.5" /> Privileged
                </div>
                <div className="text-warning/90 font-medium mb-1 capitalize">{docDetail.classification.privilege_type?.replace('_', ' ')}</div>
                <div className="text-warning/80 text-xs leading-relaxed">{docDetail.classification.privilege_reason}</div>
              </div>
            )}

            <div className="text-sm flex flex-col border-t border-border pt-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-muted-foreground">Category</span> 
                <span className="font-medium">{categories?.find(c => c.id === docDetail.classification?.category_id)?.name || 'None'}</span>
              </div>
              
              {isMovingCategory ? (
                <div className="mt-2 space-y-2">
                  <div className="text-xs font-medium text-muted-foreground mb-1">Select new category:</div>
                  <div className="max-h-40 overflow-y-auto border border-border rounded-md bg-background">
                    {categories?.map(category => (
                      <button
                        key={category.id}
                        onClick={() => handleMoveCategory(category.id)}
                        className={`w-full text-left px-3 py-2 text-sm hover:bg-accent transition-colors ${docDetail.classification?.category_id === category.id ? 'bg-primary/5 text-primary font-medium' : ''}`}
                      >
                        {category.name}
                      </button>
                    ))}
                  </div>
                  <button 
                    onClick={() => setIsMovingCategory(false)}
                    className="w-full text-xs text-muted-foreground hover:text-foreground py-1"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => setIsMovingCategory(true)}
                  className="flex items-center justify-center w-full py-1.5 mt-1 text-xs font-medium text-primary bg-primary/5 hover:bg-primary/10 rounded border border-primary/20 transition-colors"
                >
                  <FolderInput className="w-3.5 h-3.5 mr-1.5" />
                  Move Category
                </button>
              )}
            </div>
          </div>
        </section>

        <section>
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3 flex items-center">
            <span className="w-4 h-[1px] bg-border mr-2"></span>
            Review
            <span className="flex-1 h-[1px] bg-border ml-2"></span>
          </h3>
          
          <div className="space-y-2">
            <label className={`flex items-center space-x-3 text-sm p-3 rounded-md border cursor-pointer transition-colors ${docDetail.review?.decision === 'relevant' ? 'border-success bg-success/5 text-success font-medium' : 'border-border hover:bg-accent'}`}>
              <input type="radio" name="decision" value="relevant" checked={docDetail.review?.decision === 'relevant'} onChange={() => handleDecisionChange('relevant')} className="text-success focus:ring-success w-4 h-4" />
              <span>Relevant</span>
            </label>
            <label className={`flex items-center space-x-3 text-sm p-3 rounded-md border cursor-pointer transition-colors ${docDetail.review?.decision === 'not_relevant' ? 'border-muted-foreground bg-muted text-foreground font-medium' : 'border-border hover:bg-accent'}`}>
              <input type="radio" name="decision" value="not_relevant" checked={docDetail.review?.decision === 'not_relevant'} onChange={() => handleDecisionChange('not_relevant')} className="text-muted-foreground focus:ring-muted-foreground w-4 h-4" />
              <span>Not Relevant</span>
            </label>
            <label className={`flex items-center space-x-3 text-sm p-3 rounded-md border cursor-pointer transition-colors ${docDetail.review?.decision === 'privileged' ? 'border-warning bg-warning/10 text-warning font-medium' : 'border-warning/30 hover:bg-warning/5 text-warning'}`}>
              <input type="radio" name="decision" value="privileged" checked={docDetail.review?.decision === 'privileged'} onChange={() => handleDecisionChange('privileged')} className="text-warning focus:ring-warning w-4 h-4" />
              <span className="font-medium">Privileged</span>
            </label>
            <label className={`flex items-center space-x-3 text-sm p-3 rounded-md border cursor-pointer transition-colors ${docDetail.review?.decision === 'needs_review' ? 'border-primary bg-primary/5 text-primary font-medium' : 'border-border hover:bg-accent'}`}>
              <input type="radio" name="decision" value="needs_review" checked={docDetail.review?.decision === 'needs_review'} onChange={() => handleDecisionChange('needs_review')} className="text-primary focus:ring-primary w-4 h-4" />
              <span>Needs Review</span>
            </label>
          </div>

          <div className="mt-6 space-y-4">
            <div>
              <label className="text-sm font-medium block mb-1.5">Tags</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {docDetail.tags?.map(tag => (
                  <span key={tag} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                    {tag}
                    <button onClick={() => handleRemoveTag(tag)} className="ml-1 hover:text-primary/70 focus:outline-none">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <input 
                type="text" 
                value={tagText}
                onChange={e => setTagText(e.target.value)}
                onKeyDown={handleAddTag}
                placeholder="Add a tag and press Enter..." 
                className="w-full text-sm p-2 rounded-md border border-border bg-background focus:ring-1 focus:ring-primary focus:border-primary outline-none"
              />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1.5">Notes</label>
              <div className="space-y-2 mb-2">
                {docDetail.notes?.map(note => (
                  <div key={note.id} className="text-xs p-2 bg-muted/50 rounded border border-border/50">
                    <div className="text-muted-foreground mb-1 flex justify-between">
                      <span>{note.author}</span>
                      <span>{new Date(note.created_at).toLocaleDateString()}</span>
                    </div>
                    <div>{note.content}</div>
                  </div>
                ))}
              </div>
              <div className="relative">
                <textarea 
                  value={noteText}
                  onChange={e => setNoteText(e.target.value)}
                  className="w-full text-sm p-2.5 pr-10 rounded-md border border-border bg-background resize-none h-20 focus:ring-1 focus:ring-primary focus:border-primary outline-none" 
                  placeholder="Add a note..."
                ></textarea>
                <button 
                  onClick={handleAddNote}
                  disabled={!noteText.trim()}
                  className="absolute bottom-2 right-2 p-1.5 bg-primary text-primary-foreground rounded-md disabled:opacity-50"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
