import {registerHooks,createRequire} from 'node:module';
import {readFileSync,existsSync,statSync} from 'node:fs';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {resolve,dirname} from 'node:path';
const root=resolve(import.meta.dirname,'../../..');
const ts=createRequire(resolve(root,'scripts/package.json'))('typescript');
registerHooks({
 resolve(specifier,context,next){
  try{return next(specifier,context);}catch(error){
   if(!context.parentURL?.startsWith('file:')||(!specifier.startsWith('.')&&!specifier.startsWith('@/')))throw error;
   const parent=fileURLToPath(context.parentURL);
   const base=specifier.startsWith('@/')?resolve(root,parent.replaceAll('\\','/').includes('/artifacts/fi-forgot/')?'artifacts/fi-forgot/src':'artifacts/api-server/src',specifier.slice(2)):resolve(dirname(parent),specifier);
   for(const candidate of [base+'.ts',base+'.tsx',base.replace(/\.js$/,'.ts'),base.replace(/\.jsx$/,'.tsx'),resolve(base,'index.ts'),resolve(base,'index.tsx')])if(existsSync(candidate)&&statSync(candidate).isFile())return next(pathToFileURL(candidate).href,context);
   throw error;
  }
 },
 load(url,context,next){
  if(url===pathToFileURL(createRequire(resolve(root,'scripts/package.json')).resolve('tsx/cli')).href){
   return {format:'module',shortCircuit:true,source:`
    import {resolve} from 'node:path';import {pathToFileURL} from 'node:url';
    const args=process.argv.slice(2);
    if(args[0]!=='--tsconfig'||args[1]!=='artifacts/fi-forgot/tsconfig.json'||args[2]!=='artifacts/fi-forgot/src/__tests__/relationship-opportunity-serialized-consumer.test.ts'||args.length!==3)throw new Error('Unsupported legacy child launcher arguments');
    await import(pathToFileURL(resolve(args[2])).href);
   `};
  }
  if(url.startsWith('file:')&&/\.tsx?$/.test(url)){
   const file=fileURLToPath(url);
   const source=ts.transpileModule(readFileSync(file,'utf8'),{fileName:file,compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText;
   return {format:'module',source,shortCircuit:true};
  }
  return next(url,context);
 }
});
