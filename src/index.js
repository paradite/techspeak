const cfgtool = require('cfgrammar-tool');
const types = cfgtool.types;
const generatorFactory = cfgtool.generator;

const Grammar = types.Grammar;
const Rule = types.Rule;
const T = types.T;
const NT = types.NT;
const maxLength = 18;
const minLength = 11;
const fixedMapping = {
  android: 'NN',
  string: 'NN',
  dictionary: 'NN',
  drupal: 'NN',
  paypal: 'NN',
  datatable: 'NN',
  sed: 'NN',
};

const techRules = [];

fetch('tags_with_pos.json')
  .then(function(response) {
    return response.json();
  })
  .then(function(tags_with_pos) {
    for (var i = 0; i < tags_with_pos.length; i++) {
      // fix some errors from nltk
      if (fixedMapping[tags_with_pos[i][0]]) {
        tags_with_pos[i][1] = fixedMapping[tags_with_pos[i][0]];
        console.log('fixed', tags_with_pos[i][0]);
      }

      // https://pythonprogramming.net/natural-language-toolkit-nltk-part-speech-tagging/
      if (tags_with_pos[i][1] === 'NN' || tags_with_pos[i][1] === 'NNS') {
        techRules.push(Rule('N', [T(tags_with_pos[i][0])]));
      } else if (tags_with_pos[i][1] === 'VBD') {
        // verb, past tense
        // console.warn('VBD', tags_with_pos[i][0]);
        // techRules.push(Rule('VP', [T(tags_with_pos[i][0])]));
      } else if (tags_with_pos[i][1] === 'VBP') {
        // verb, present
        console.warn('VBP', tags_with_pos[i][0]);
        techRules.push(Rule('VP', [T(tags_with_pos[i][0])]));
      } else if (tags_with_pos[i][1] === 'VBG') {
        // verb, present participle
        console.warn('VBG', tags_with_pos[i][0]);
        techRules.push(Rule('VBG', [T('is'), T(' '), T(tags_with_pos[i][0])]));
      } else if (tags_with_pos[i][1] === 'JJ') {
        // adjective
        console.warn('JJ', tags_with_pos[i][0]);
        techRules.push(Rule('JJ', [T(tags_with_pos[i][0])]));
      } else {
        console.log('unknown', tags_with_pos[i][1], tags_with_pos[i][0]);
      }
    }

    const exprGrammar = Grammar([
      Rule('S', [NT('NP'), T(' '), NT('VP'), T('.')]),
      // expand only once for adjective
      Rule('NP', [NT('Det'), T(' '), NT('N')]),
      Rule('NP', [NT('Det'), T(' '), NT('NJJ')]),
      Rule('NP', [NT('Det'), T(' '), NT('N'), T(' '), NT('PP')]),
      Rule('NP', [NT('Det'), T(' '), NT('NJJ'), T(' '), NT('PP')]),
      Rule('NJJ', [NT('JJ'), T(' '), NT('N')]),
      Rule('PP', [NT('P'), T(' '), NT('NP')]),
      Rule('VP', [NT('VP'), T(' '), NT('PP')]),
      Rule('VP', [NT('V'), T(' '), NT('NP')]),
      Rule('Det', [T('the')]),
      // TODO: fix a/an
      // Rule('Det', [T('a')]),
      Rule('P', [T('in')]),
      Rule('P', [T('with')]),
      Rule('V', [NT('VBG')]),
      ...techRules,
    ]);

    function regenerate() {
      const generator = generatorFactory(exprGrammar);
      let length = null;
      let sentence = null;
      while (!sentence) {
        length =
          Math.floor(Math.random() * (maxLength - minLength + 1)) + minLength;
        sentence = generator(length);
      }
      document.getElementById('result').innerHTML = sentence;
    }
    regenerate();
    const refreshButton = document.getElementById('refresh');
    refreshButton.addEventListener('click', function() {
      regenerate();
    });
  });
