'use client';

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { CustomizationMap } from '@/types/template';

interface Draft {
  templateId: string;
  sections: Record<string, string>;
  customizations: CustomizationMap;
  savedAt: number;
}

interface TemplateState {
  favorites: Set<string>;
  customizations: Record<string, CustomizationMap>;
  drafts: Record<string, Draft>;
  editingSectionId: string | null;
  editingSectionContent: string;
}

type Action =
  | { type: 'TOGGLE_FAVORITE'; id: string }
  | { type: 'SET_FIELD'; templateId: string; fieldName: string; value: string }
  | { type: 'RESET_FIELDS'; templateId: string }
  | { type: 'LOAD_PERSISTED'; state: TemplateState }
  | { type: 'START_EDIT_SECTION'; sectionId: string; content: string }
  | { type: 'UPDATE_EDIT_CONTENT'; content: string }
  | { type: 'CANCEL_EDIT_SECTION' }
  | { type: 'SAVE_DRAFT'; templateId: string; sections: Record<string, string>; customizations: CustomizationMap }
  | { type: 'DELETE_DRAFT'; templateId: string }
  | { type: 'RESTORE_DRAFT'; draft: Draft };

const TemplateContext = createContext<{
  state: TemplateState;
  dispatch: React.Dispatch<Action>;
} | null>(null);

const initialState: TemplateState = {
  favorites: new Set(),
  customizations: {},
  drafts: {},
  editingSectionId: null,
  editingSectionContent: '',
};

function reducer(state: TemplateState, action: Action): TemplateState {
  switch (action.type) {
    case 'TOGGLE_FAVORITE': {
      const newFavorites = new Set(state.favorites);
      if (newFavorites.has(action.id)) {
        newFavorites.delete(action.id);
      } else {
        newFavorites.add(action.id);
      }
      return { ...state, favorites: newFavorites };
    }

    case 'SET_FIELD': {
      const customizations = {
        ...state.customizations,
        [action.templateId]: {
          ...state.customizations[action.templateId],
          [action.fieldName]: action.value,
        },
      };
      return { ...state, customizations };
    }

    case 'RESET_FIELDS': {
      const { [action.templateId]: _removed, ...rest } =
        state.customizations;
      return { ...state, customizations: rest };
    }

    case 'START_EDIT_SECTION': {
      return {
        ...state,
        editingSectionId: action.sectionId,
        editingSectionContent: action.content,
      };
    }

    case 'UPDATE_EDIT_CONTENT': {
      return {
        ...state,
        editingSectionContent: action.content,
      };
    }

    case 'CANCEL_EDIT_SECTION': {
      return {
        ...state,
        editingSectionId: null,
        editingSectionContent: '',
      };
    }

    case 'SAVE_DRAFT': {
      const drafts = {
        ...state.drafts,
        [action.templateId]: {
          templateId: action.templateId,
          sections: action.sections,
          customizations: action.customizations,
          savedAt: Date.now(),
        },
      };
      return {
        ...state,
        drafts,
        editingSectionId: null,
        editingSectionContent: '',
      };
    }

    case 'DELETE_DRAFT': {
      const { [action.templateId]: _removed, ...rest } = state.drafts;
      return { ...state, drafts: rest };
    }

    case 'RESTORE_DRAFT': {
      return {
        ...state,
        customizations: {
          ...state.customizations,
          [action.draft.templateId]: action.draft.customizations,
        },
      };
    }

    case 'LOAD_PERSISTED': {
      return action.state;
    }

    default:
      return state;
  }
}

export function TemplateProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Load persisted state from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('templateState');
      if (saved) {
        const parsed = JSON.parse(saved);
        dispatch({
          type: 'LOAD_PERSISTED',
          state: {
            favorites: new Set(parsed.favorites),
            customizations: parsed.customizations,
            drafts: parsed.drafts || {},
            editingSectionId: null,
            editingSectionContent: '',
          },
        });
      }
    } catch (error) {
      console.error('Error loading persisted state:', error);
    }
  }, []);

  // Persist state to localStorage whenever it changes
  useEffect(() => {
    const toSave = {
      favorites: Array.from(state.favorites),
      customizations: state.customizations,
      drafts: state.drafts,
    };
    localStorage.setItem('templateState', JSON.stringify(toSave));
  }, [state]);

  return (
    <TemplateContext.Provider value={{ state, dispatch }}>
      {children}
    </TemplateContext.Provider>
  );
}

export function useTemplateContext() {
  const context = useContext(TemplateContext);
  if (!context) {
    throw new Error(
      'useTemplateContext must be used within a TemplateProvider'
    );
  }
  return context;
}
