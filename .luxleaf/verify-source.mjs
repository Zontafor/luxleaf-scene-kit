import{readFile}from'node:fs/promises';import{createHash}from'node:crypto';
const manifest=JSON.parse(await readFile('.luxleaf/upstream-manifest.json','utf8'));let verified=0;
for(const[path,hash]of Object.entries(manifest.files)){const location=manifest.relocations[path]??path;const actual=createHash('sha256').update(await readFile(location)).digest('hex');if(actual!==hash)throw Error('Upstream source differs: '+path);verified++;}
console.log(JSON.stringify({repository:manifest.repository,revision:manifest.revision,verified,modifiedUpstreamFiles:0}));
