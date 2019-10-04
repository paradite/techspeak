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
  substring: 'NN',
  sed: 'X',
  networking: 'X',
  nsstring: 'X',
};

const techRules = [];

fetch('static/tags_with_pos.json')
  .then(function(response) {
    return response.json();
  })
  .then(function(tags_with_pos) {
    for (var i = 0; i < tags_with_pos.length; i++) {
      let [word, pos] = tags_with_pos[i];
      // fix some errors from nltk
      if (fixedMapping.hasOwnProperty(word)) {
        pos = fixedMapping[word];
        console.log('fixed', word);
      }

      // https://pythonprogramming.net/natural-language-toolkit-nltk-part-speech-tagging/
      if (pos === 'NN' || pos === 'NNS') {
        techRules.push(Rule('N', [T(word)]));
      } else if (pos === 'VBD') {
        // verb, past tense, ignore
      } else if (pos === 'VBP') {
        // verb, present
        techRules.push(Rule('VP', [T(word)]));
        setTimeout(() => {
          console.log('VP: ' + word);
        }, 0);
      } else if (pos === 'VBG') {
        // verb, present participle
        techRules.push(Rule('VBG', [T('is'), T(' '), T(word)]));
        setTimeout(() => {
          console.log('VBG: ' + word);
        }, 100);
      } else if (pos === 'JJ') {
        // adjective
        techRules.push(Rule('JJ', [T(word)]));
        setTimeout(() => {
          console.log('JJ: ' + word);
        }, 200);
      } else {
        console.log('unknown', pos, word);
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
