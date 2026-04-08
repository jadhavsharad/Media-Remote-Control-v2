import { storage } from 'wxt/utils/storage';

export interface Device {
  id: string;
  platform?: string;
  connectedAt: number;
}

export const hostToken = storage.defineItem<string | null>("local:hostToken", { defaultValue: null })
export const isSocketConnected = storage.defineItem<boolean>("local:isSocketConnected", { defaultValue: false })
export const sessionIdentity = storage.defineItem<string | null>("local:sessionIdentity", { defaultValue: null })
export const pairingKey = storage.defineItem<string | null>("local:pairingKey", { defaultValue: null })
export const pairingKeyExpiry = storage.defineItem<number | null>("local:pairingKeyExpiry", { defaultValue: null })
export const connectedDevices = storage.defineItem<Device[]>("local:connectedDevices", { defaultValue: [] })
