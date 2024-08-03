import Aura from '@primevue/themes/aura';
import { VueQueryPlugin } from '@tanstack/vue-query';
import PrimeVue from 'primevue/config';
import { createApp } from 'vue';
import App from './App.vue';
import "./assets/index.scss";
import "primeicons/primeicons.css";
import ToastService from 'primevue/toastservice';

createApp(App)
    .use(VueQueryPlugin)
    .use(ToastService)
    .use(PrimeVue, { theme: { preset: Aura } })
    .mount('#app');
