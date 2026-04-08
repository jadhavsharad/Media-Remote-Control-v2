import { defineConfig, defineWebExtConfig } from 'wxt';
import { platforms } from './config/constants';

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  manifest: {
    name: "Media Remote Control",
    permissions: ["tabs", "offscreen", 'storage', "scripting"],
    host_permissions: platforms,    
    
  },
  webExt: defineWebExtConfig({
    disabled: true,
  })

});
