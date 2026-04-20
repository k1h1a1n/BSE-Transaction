// form-tabs.actions.ts
import { createAction, props } from '@ngrx/store';

export const goToTab = createAction(
    'Go To Tab',
    props<{ tabIndex: number }>()
);

export const nextTab = createAction('Next Tab');

export const previousTab = createAction('Previous Tab');

export const setEditMode = createAction(
    '[UCC Tabs] Set Edit Mode',
    props<{ isEditMode: boolean; editData: any | null }>()
);

export const resetEditMode = createAction('[UCC Tabs] Reset Edit Mode');

export const setRegistrationData = createAction(
    '[UCC Tabs] Set Registration Data',
    props<{ registrationData: any }>()
);

