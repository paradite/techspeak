import json
import nltk
from stackapi import StackAPI

# setup nltk data first before running the code
# python
# >>> import nltk
# >>> nltk.download()

SITE = StackAPI('stackoverflow')
SITE.page_size = 100
SITE.max_pages = 4
tags = [x['name'] for x in SITE.fetch('tags')['items'] if x['name'].isalpha()]

# get pos tag individually to avoid confusing the tagger
tags_with_pos = [nltk.tag.pos_tag([tag])[0] for tag in tags]

with open('tags.json', 'w') as outfile:
  json.dump(tags, outfile, indent=2)

with open('tags_with_pos.json', 'w') as outfile:
  json.dump(tags_with_pos, outfile, indent=2)
