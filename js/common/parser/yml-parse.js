// const {YamlReader} = require('y2j');
const yamlReader = require('yaml-reader');
const YAML = require('json-to-pretty-yaml');

function ymlToJSON(filePath){
   return yamlReader.read(filePath) 
}

function jsonToYml(json){
    return YAML.stringify(json);
}


module.exports={
    ymlToJSON:ymlToJSON,
    jsonToYml:jsonToYml
}