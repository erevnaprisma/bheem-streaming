# RAYAPAY BACKEND #

Modul untuk backend aplikasi mobile rayapay. Dibuat menggunakan Node Js.

## Keterangan file dan directori

- **bin**               = berisi script untuk startup aplikasi. Atau script yang lain yang di eksekusi pakai npm.
- **controllers**       = semua logic atau bisnis process
- **models**            = schema table atau collection. dan interface untuk berhubungan dengan database layer, termasuk elasticsearch
- **middlewares**       = logic atau bisnis process tambahan sebelum execute controllers.
- **public**            = berisi file-file static seperti image, css, js, dan lain-lain
- **views**             = berisi file html
- **app.js**            = file yang akan di execute pertama kali saat startup
- **config.js**         = berisi parameter-parameter configurasi aplikasi, seperti, koneksi database atau elasticsearch
- **bootstrap.js**  = file yang akan di execute dari file app.js. file ini berguna untuk menambahkan logic-logic tambahan saat startup aplikasi.
- **package.json**  = informasi tentang aplikasi atau metadata dari aplikasi. semua daftar dependency library javascript.
## Clone 
```bash
git clone https://<username>@bitbucket.org/deX_team/rayapay-backend-njs.git
```

## Install
```bash
npm install
```

## Start Production (untuk server production)
```bash
npm start
```
## Start Development (untuk server di localhost)
```bash
npm run start:dev
```


## deploy gcp
```bash
## deploy
gcloud app deploy app.standard.yaml
## stream log
gcloud app logs tail -s default
## view your application in the web browser run
gcloud app browse
```