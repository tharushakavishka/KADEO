const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript');
const output=ts.transpileModule(fs.readFileSync('src/lib/store-custom-styles.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
const exportsObject={};vm.runInNewContext(output,{exports:exportsObject});
const {customStyle,validCustomStyle,customControls,styleAreas}=exportsObject;
test('rejects injected CSS, unknown controls and out-of-range styles',()=>{
 for(const [key,value] of [['custom:card:background','url(https://bad.test)'],['custom:card:color','#fff;display:none'],['custom:navbar:radius','51'],['custom:search:opacity','-1'],['custom:buttons:blur','NaN'],['custom:card:padding','1.5'],['custom:unknown:radius','2'],['custom:card:position','fixed']])assert.equal(validCustomStyle(key,value),false);
 for(const area of styleAreas)for(const control of customControls){const key=`custom:${area.id}:${control.id}`;assert.equal(validCustomStyle(key,control.type==='color'?'#abcdef':String(control.max)),true);}
});
test('old stores retain their exact styles; custom background opacity never fades text',()=>{
 assert.equal(JSON.stringify(customStyle((k,f)=>f,'card')),'{}');
 const values={'custom:card:background':'#123456','custom:card:opacity':'25','custom:card:radius':'0','custom:card:shadow':'0','custom:card:blur':'15'};
 const style=customStyle((k,f)=>values[k]??f,'card');
 assert.equal(style.background,'rgba(18, 52, 86, 0.25)');assert.equal(style.opacity,undefined);assert.equal(style.borderRadius,'0px');assert.equal(style.boxShadow,'none');assert.equal(style.backdropFilter,'blur(15px)');
 assert.equal(JSON.stringify(customStyle((k,f)=>values[k]??f,'navbar')),'{}');
});
