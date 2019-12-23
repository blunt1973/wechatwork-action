const core = require('@actions/core');
const axios = require('axios');

String.prototype.interpolate = function (params) {
  const names = Object.keys(params);
  const vals = Object.values(params);
  return new Function(...names, `return \`${this}\`;`)(...vals);
}

async function run () {

  try {
    const url = core.getInput('url');
    const type = core.getInput('type');
    const content = core.getInput('content');
    const at = core.getInput('at');
    const envs = process.env

    const format_content = content.interpolate(envs);


    let payload = {
      msgtype: 'text',
      text: {
        content: format_content
      },
      mentioned_list : {}
    };

    if(type === "text"){
      if (at !== '') {
        if (at.toLowerCase() === 'all') {
          payload.text.mentioned_list = ["@all"];
        }else{
          payload.text.mentioned_list = at.split(",");
        }
      }
    }

    if (type === 'markdown') {
      payload = {
        msgtype: 'markdown',
        markdown: {
          content: format_content
        }
      };
    }

    if (type === "custom"){
      payload = JSON.parse(content)
    }

    const ret = await axios.post(url, JSON.stringify(payload), {
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();