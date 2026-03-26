import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import { provideHttpClient } from '@angular/common/http';

// bootstrapApplication(App, appConfig)
//   .catch((err) => console.error(err));


// fetch('assets/config.json?lastAccess=' + Date.now())
//   .then(resp => resp.json())
//   .then(config => {
//     (window as any)['APP_CONFIG'] = config;
//     console.log('✅ Loaded App Config:', config);

//         return bootstrapApplication(App, {
//       ...appConfig,
//       providers: [
//         ...(appConfig.providers || []),
//         provideHttpClient()   // ✅ register HttpClient globally
//       ]
//     });
  
//   })
//   .catch(err => console.error('❌ Error loading config:', err));


fetch('assets/config.json?lastAccess=' + Date.now())
  .then((resp) => {
    return resp.json();
  })
  .then((config) => {
    
    // Assign the fetched config to the global APP_CONFIG
    (window as any)['APP_CONFIG']= config;
    console.log('✅ Loaded App Config:', config);

  })
  .then(() => {
    bootstrapApplication(App, appConfig).catch((err) =>
      console.error(err)
    );
  })
  .catch((err) => {
    console.error('Error fetching config:', err);
  });



