import { storage } from 'wxt/utils/storage';

export interface Device {
  id: string;
  browser: string;
  modelName: string;
  platform: string;
  connectedAt: number;
}

export const hostToken = storage.defineItem<string | null>("local:hostToken", { defaultValue: null })
export const isSocketConnected = storage.defineItem<boolean>("local:isSocketConnected", { defaultValue: false })
export const sessionIdentity = storage.defineItem<string | null>("local:sessionIdentity", { defaultValue: null })
export const pairingKey = storage.defineItem<string | null>("session:pairingKey", { defaultValue: null })
export const pairingKeyExpiry = storage.defineItem<number | null>("session:pairingKeyExpiry", { defaultValue: null })
export const pairingKeyCreatedAt = storage.defineItem<number | null>("session:pairingKeyCreatedAt", { defaultValue: null })
export const connectedDevices = storage.defineItem<Device[]>("local:connectedDevices", { defaultValue: [] })
