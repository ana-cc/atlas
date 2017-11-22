import json
import re
import urllib.request

response = urllib.request.urlopen("https://gitweb.torproject.org/tor.git/plain/src/or/fallback_dirs.inc")
lines = [x.decode("ascii") for x in response.readlines()]

fingerprints = []
for line in lines:
    if line.startswith("\""):
        m = re.search('(?<=id=)\w+', line)
        if m:
            fingerprints.append(m.group(0))

print("""

/*
This file is generated by scripts/fallback_dir.py.

To update run:

python3 scripts/fallback_dir.py > js/fallback_dir.js
*/

var fallbackDirs = %s;

function IsFallbackDir(fingerprint) {
  return $.inArray(fingerprint, fallbackDirs) > -1;
}
""" % (json.dumps(fingerprints)))
