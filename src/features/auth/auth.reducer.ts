import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {appActions} from "app/app.reducer";
import {authAPI, LoginParamsType} from "features/auth/auth.api";
import {clearTasksAndTodolists} from "common/actions";
import {createAppAsyncThunk, handleServerAppError, handleServerNetworkError} from "common/utils";
import {BaseResponseType} from "common/types";
import {thunkTryCatch} from "common/utils/thunkTryCatch";

const slice = createSlice({
    name: "auth",
    initialState: {
        isLoggedIn: false,
    },
    reducers: {
    },
    extraReducers: builder => {
        builder
            .addCase(login.fulfilled, (state, action) => {
                state.isLoggedIn = action.payload.isLoggedIn;
            })
            .addCase(logout.fulfilled, (state, action) => {
                state.isLoggedIn = action.payload.isLoggedIn;
            })
            .addCase(initializeApp.fulfilled, (state, action) => {
                state.isLoggedIn = action.payload.isLoggedIn;
            })
    }
});


const login = createAppAsyncThunk<{
    isLoggedIn: boolean
}, LoginParamsType>(`${slice.name}/login`, async (arg, thunkAPI) => {
    const {dispatch, rejectWithValue} = thunkAPI;
    try {
        dispatch(appActions.setAppStatus({status: "loading"}));
        const res = await authAPI.login(arg);

        if (res.data.resultCode === 0) {
            dispatch(appActions.setAppStatus({status: "succeeded"}));
            return {isLoggedIn: true};
        } else {
           // handleServerAppError(res.data, dispatch);
            dispatch(appActions.setAppStatus({status: "failed"}));
            return rejectWithValue(res.data)
        }
    } catch (error: any) {
        handleServerNetworkError(error, dispatch);
        return rejectWithValue(null)
    }
});
// thunks
export const logout = createAppAsyncThunk<any, any>(`${slice.name}/logout`, async (arg, thunkAPI) => {
    const {dispatch, rejectWithValue} = thunkAPI;
    try {
        dispatch(appActions.setAppStatus({status: "loading"}));
        const res = await authAPI.logout()

        if (res.data.resultCode === 0) {
            // dispatch(authActions.setIsLoggedIn({isLoggedIn: false}));
            dispatch(clearTasksAndTodolists());
            dispatch(appActions.setAppStatus({status: "succeeded"}));
            return {isLoggedIn: false}
        } else {
            handleServerAppError(res.data, dispatch, false);
            return rejectWithValue(null)
        }
    } catch (error: any) {
        handleServerNetworkError(error, dispatch);
        return rejectWithValue(null)
    }

})
export const initializeApp = createAppAsyncThunk<any, undefined>(`${slice.name}/initializeApp`, async (_, thunkAPI) => {
    const {dispatch, rejectWithValue} = thunkAPI;
    return thunkTryCatch(thunkAPI, async ()=>{
        const res = await authAPI.me()
        if (res.data.resultCode === 0) {
            return {isLoggedIn: true};
        }
        else {

            // handleServerAppError(res.data, dispatch)
            return rejectWithValue(null)
        }
    }).finally(()=>{
        dispatch(appActions.setAppInitialized({isInitialized: true}));
    })

})


export const authReducer = slice.reducer;
export const authActions = slice.actions;
export const authThunk = {login, logout, initializeApp};
