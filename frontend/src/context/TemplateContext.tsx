'use client';

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { CustomizationMap } from '@/types/template';

interface TemplateState {
  favorites: Set<string>;
  customizations: Record<string, CustomizationMap>;
}

type Action =
  | { type: 'TOGGLE_FAVORITE'; id: string }
  | { type: 'SET_FIELD'; templateId: string; fieldName: string; value: string }
  | { type: 'RESET_FIELDS'; templateId: string }
  | { type: 'LOAD_PERSISTED'; state: TemplateState };

const TemplateContext = createContext<{
  state: TemplateState;
  dispatch: React.Dispatch<Action>;
} | null>(null);

const initialState: TemplateState = {
  favorites: new Set(),
  customizations: {},
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
