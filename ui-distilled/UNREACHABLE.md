# Sites not reachable from this environment

Five requested sites could not be fetched here. This is a network restriction in the
environment, not a property of the sites.

| Site | node fetch | curl (sandbox off) | in-app browser |
|---|---|---|---|
| https://www.mariavasilyeva.com/ | `UND_ERR_CONNECT_TIMEOUT` | `000` (timeout after 12s) | navigation denied |
| https://www.quintinlodge.com/ | `UND_ERR_CONNECT_TIMEOUT` | `000` | not attempted after the first denial |
| https://jesperlandberg.com/ | `UND_ERR_CONNECT_TIMEOUT` | `000` | navigation denied |
| https://www.maisonauge.com/ | `UND_ERR_CONNECT_TIMEOUT` | `000` | not attempted after the first denial |
| https://www.trevornoah.com/ | `ERR_TIMED_OUT` | `000` | navigation denied |
| https://mecha-xyz.webflow.io/ | 200 | 200 | loads |
| https://www.ceragres.ca/ | timeout (curl fallback works) | 200 | loads |
| https://brand.squarespace.com/ | 200 | 200 | loads |

DNS resolves for all of them (`jesperlandberg.com` → `75.2.60.5`, `www.trevornoah.com` → `198.202.211.1`), so the failure is at connect time:
egress appears to be limited to an allowlist that includes `webflow.io` and `cdn.prod.website-files.com`
but not these domains. Retrying, changing user agent, or disabling the sandbox does not change the result,
and none of those would be an appropriate workaround anyway.

To distil these sites, run the skill from a machine with open egress:

```bash
node ~/.claude/skills/ui-distiller/scripts/probe.mjs https://jesperlandberg.com/ --out ui-distilled/jesperlandberg.com/.work
```

then continue with the browser pass as described in the skill.
