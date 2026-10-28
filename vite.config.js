import {defineConfig} from "vite";
import vue from "@vitejs/plugin-vue";
import {viteSingleFile} from "vite-plugin-singlefile";

/* vue-i18n 打包后带一个字面的 U+FFFD，转成 \uFFFD 转义，免得被当成乱码 */
const escapeFffd={name:"escape-fffd",generateBundle(_,bundle){
  for(const f of Object.values(bundle))if(f.type==="chunk"&&f.code.includes("\uFFFD"))f.code=f.code.replaceAll("\uFFFD","\\uFFFD");
}};

/* npm run build → dist/（图片在 dist/images）；npm run build:single → dist-single/index.html 单文件，图片另外放 */
export default defineConfig(({mode})=>({
  base:"./",
  plugins:[vue(),escapeFffd,...(mode==="single"?[viteSingleFile()]:[])],
  define:{__VUE_I18N_FULL_INSTALL__:true,__VUE_I18N_LEGACY_API__:false,__INTLIFY_PROD_DEVTOOLS__:false},
  build:{outDir:mode==="single"?"dist-single":"dist",copyPublicDir:mode!=="single"}
}));
