const cfgtool = require('cfgrammar-tool');
const types = cfgtool.types;
const generatorFactory = cfgtool.generator;

const Grammar = types.Grammar;
const Rule = types.Rule;
const T = types.T;
const NT = types.NT;
const maxLength = 9;
const minLength = 5;
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
      } else if (pos === 'VBG') {
        // verb, present participle
        techRules.push(Rule('VBG', [T('is'), T(word)]));
      } else if (pos === 'JJ') {
        // adjective
        techRules.push(Rule('JJ', [T(word)]));
      } else {
        console.log('unknown', pos, word);
      }
    }

    const exprGrammar = Grammar([
      Rule('S', [NT('NP'), NT('VP')]),
      // expand only once for adjective
      Rule('NP', [NT('Det'), NT('N')]),
      Rule('NP', [NT('Det'), NT('NJJ')]),
      Rule('NP', [NT('Det'), NT('N'), NT('PP')]),
      Rule('NP', [NT('Det'), NT('NJJ'), NT('PP')]),
      Rule('NJJ', [NT('JJ'), NT('N')]),
      Rule('PP', [NT('P'), NT('NP')]),
      Rule('VP', [NT('VP'), NT('PP')]),
      Rule('VP', [NT('V'), NT('NP')]),
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
      let tokens = null;
      while (!tokens) {
        length =
          Math.floor(Math.random() * (maxLength - minLength + 1)) + minLength;
        tokens = generator(length, {
          list: true,
        });
      }
      const sentence = tokens.join(' ') + '.';
      document.getElementById('result').innerHTML = sentence;
    }
    regenerate();
    const refreshButton = document.getElementById('refresh');
    refreshButton.addEventListener('click', function() {
      regenerate();
    });
  });
