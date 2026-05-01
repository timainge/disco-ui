import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export const useStats = () => useQuery({ queryKey: ['stats'], queryFn: api.getStats });

export const useBoxes = () => useQuery({ queryKey: ['boxes'], queryFn: api.getBoxes });

export const useCategories = (boxId?: string) => useQuery({ 
  queryKey: ['categories', boxId], 
  queryFn: () => api.getCategories(boxId) 
});

export const useDocuments = (filters: any = {}) => useQuery({ 
  queryKey: ['documents', filters], 
  queryFn: () => api.getDocuments(filters) 
});

export const useDocumentDetail = (id: string | null) => useQuery({ 
  queryKey: ['document', id], 
  queryFn: () => id ? api.getDocumentDetail(id) : null,
  enabled: !!id
});

export const useSubmitReview = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, decision }: { id: string, decision: string }) => api.submitReview(id, decision),
    onMutate: async ({ id, decision }) => {
      await queryClient.cancelQueries({ queryKey: ['document', id] });
      const previousDoc = queryClient.getQueryData(['document', id]);
      
      queryClient.setQueryData(['document', id], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          review: { id: 'temp', decision, reviewer: 'me', created_at: new Date().toISOString() }
        };
      });
      
      return { previousDoc };
    },
    onError: (err, variables, context) => {
      if (context?.previousDoc) {
        queryClient.setQueryData(['document', variables.id], context.previousDoc);
      }
    },
    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries({ queryKey: ['document', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    }
  });
};

export const useAddNote = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, note }: { id: string, note: string }) => api.addNote(id, note),
    onSuccess: (newNote, variables) => {
      queryClient.setQueryData(['document', variables.id], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          notes: [...(old.notes || []), newNote]
        };
      });
    }
  });
};

export const useAddTag = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, tag }: { id: string, tag: string }) => api.addTag(id, tag),
    onSuccess: (newTag, variables) => {
      queryClient.setQueryData(['document', variables.id], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          tags: [...new Set([...(old.tags || []), newTag])]
        };
      });
    }
  });
};

export const useRemoveTag = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, tag }: { id: string, tag: string }) => api.removeTag(id, tag),
    onSuccess: (removedTag, variables) => {
      queryClient.setQueryData(['document', variables.id], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          tags: (old.tags || []).filter((t: string) => t !== removedTag)
        };
      });
    }
  });
};

export const useSearchDocuments = (query: string) => useQuery({
  queryKey: ['search', query],
  queryFn: () => api.searchDocuments(query),
  enabled: true
});

export const useMoveCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, categoryId }: { id: string, categoryId: string }) => api.moveCategory(id, categoryId),
    onSuccess: (data, variables) => {
      queryClient.setQueryData(['document', variables.id], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          classification: {
            ...old.classification,
            category_id: variables.categoryId
          }
        };
      });
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    }
  });
};
