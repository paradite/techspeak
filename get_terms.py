import json
import nltk
from stackapi import StackAPI

# setup nltk data first before running the code
# python
# >>> import nltk
# >>> nltk.download()
# >>> nltk.download('averaged_perceptron_tagger')

brown_news_tagged = nltk.corpus.brown.tagged_words()
wordtags = nltk.ConditionalFreqDist((word.lower(), tag)
                                    for (word, tag) in brown_news_tagged)


SITE = StackAPI('stackoverflow')
SITE.page_size = 100
SITE.max_pages = 10
tags = [x['name'] for x in SITE.fetch('tags')['items'] if x['name'].isalpha()]
tags.sort()


def get_pos(tag):
    if len(list(wordtags[tag])) > 1:
        print(tag)
        print(list(wordtags[tag]))
        print(nltk.tag.pos_tag([tag])[0])
    return nltk.tag.pos_tag([tag])[0]


# get pos tag individually to avoid confusing the tagger
tags_with_pos = [get_pos(tag) for tag in tags]


with open('static/tags.json', 'w') as outfile:
    json.dump(tags, outfile, indent=2)

with open('static/tags_with_pos.json', 'w') as outfile:
    json.dump(tags_with_pos, outfile, indent=2)
