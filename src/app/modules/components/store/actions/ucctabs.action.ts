// form-tabs.actions.ts
import { createAction, props } from '@ngrx/store';

export const goToTab = createAction(
    'Go To Tab',
    props<{ tabIndex: number }>()
);

export const nextTab = createAction('Next Tab');

export const previousTab = createAction('Previous Tab');