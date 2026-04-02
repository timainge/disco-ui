import { useState, useEffect, useCallback } from 'react';
import { Panel, Group as PanelGroup, Separator as PanelResizeHandle } from 'react-resizable-panels';
import { BundleTree } from '@/components/review/BundleTree';
import { DocumentList } from '@/components/review/DocumentList';
import { DocumentPreview } from '@/components/review/DocumentPreview';
import { MetadataPanel } from '@/components/review/MetadataPanel';
import { useStore } from '@/store/useStore';
import { useDocuments, useSubmitReview } from '@/hooks/queries';

export function Review() {
  const [isListView, setIsListView] = useState(false);
  const selectedDocId = useStore(state => state.selectedDocId);
  const setSelectedDocId = useStore(state => state.setSelectedDocId);
  const { data: docsData } = useDocuments();
  const submitReview = useSubmitReview();

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Ignore if typing in an input or textarea
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
      return;
    }

    if (e.key.toLowerCase() === 't') {
      setIsListView(prev => !prev);
      return;
    }

    if (!selectedDocId || !docsData?.items) return;

    const docs = docsData.items;
    const currentIndex = docs.findIndex(d => d.id === selectedDocId);

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (currentIndex < docs.length - 1) {
        setSelectedDocId(docs[currentIndex + 1].id);
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (currentIndex > 0) {
        setSelectedDocId(docs[currentIndex - 1].id);
      }
    } else if (e.key.toLowerCase() === 'r') {
      submitReview.mutate({ id: selectedDocId, decision: 'relevant' });
    } else if (e.key.toLowerCase() === 'n') {
      submitReview.mutate({ id: selectedDocId, decision: 'not_relevant' });
    } else if (e.key.toLowerCase() === 'p') {
      submitReview.mutate({ id: selectedDocId, decision: 'privileged' });
    }
  }, [selectedDocId, docsData, setSelectedDocId, submitReview]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className="h-full w-full overflow-hidden">
      <PanelGroup id="review-layout" direction="horizontal" className="h-full w-full">
        <Panel defaultSize="20%" minSize="15%" maxSize="40%">
          {isListView ? <DocumentList /> : <BundleTree />}
        </Panel>
        <PanelResizeHandle className="w-1.5 flex items-center justify-center bg-transparent hover:bg-primary/20 transition-colors">
          <div className="w-1 h-8 bg-border rounded-full" />
        </PanelResizeHandle>
        <Panel defaultSize="60%" minSize="30%">
          <DocumentPreview />
        </Panel>
        <PanelResizeHandle className="w-1.5 flex items-center justify-center bg-transparent hover:bg-primary/20 transition-colors">
          <div className="w-1 h-8 bg-border rounded-full" />
        </PanelResizeHandle>
        <Panel defaultSize="20%" minSize="15%" maxSize="40%">
          <MetadataPanel />
        </Panel>
      </PanelGroup>
    </div>
  );
}
