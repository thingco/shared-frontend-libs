# Construct Package Info

This script generates a data structure that describes the details, current status and locations of all packages currently in the monorepo.

This can be used to build out the documentation as well as being a reference for other scripts.

```js
import { join } from "path";
```


```js


/**
 * @type WorkspaceRole {"packages"|"apps"|"all"}
 */

/**
 * @typedef {Object} WorkspaceItem
 * @property {string} location
 * @property {string} name
 * @property {string[]} workspaceDependencies
 * @property {string[]} mismatchedWorkspaceDependencies
 */

/**
 * @typedef {Object} WorkspaceStructure
 * @property {boolean} hasApiDocs
 * @property {boolean} hasSourceCode
 * @property {boolean} hasIntegrationTests
 * @property {boolean} hasReferenceImplementation
 */

/**
 * @typedef {Object} WorkspaceMeta
 * @property {string} description
 * @property {string} version
 * @property {string[]} peerDependencies
 */


/**
 * @param {WorkspaceRole} workspaceRole
 * @returns {(workspaceItem: WorkspaceItem) => boolean}
 */
function workspaceRoleFilter (workspaceRole) {
  return function ({ location }) {
	 return workspaceRole === "all" || location.startsWith(workspaceRole);
  }
}

/**
 * Executes Yarn's `workspaces list` command with verbose NDJSON output
 * and parses the response to a JS object.
 *
 * The optional `workspaceRole` parameter specifies which *role* of
 * package to target (packages, apps or everything). NOTE: if the
 * default "all" is used, the overall root is a workspace and so
 * will be included in the output.
 *
 * @param [WorkspaceRole] workspaceRole
 * @returns {Promise<WorkspaceItem[]>}
 */
async function workspacesList (workspaceRole = "all") {
  const predicate = workspaceRoleFilter(workspaceRole);

  return $`yarn workspaces list -v --json`
	  .then(stdout => stdout.toString())
		.then(stdout => stdout.trim().split("\n").map(ws => JSON.parse(ws)))
		.then(wspaces => wspaces.filter(predicate))
		.catch((err) => {
      console.error(err)
			process.exit(1)
		})
}

console.log(await workspacesList())
console.log(await workspacesList("package"))

/**
 * @param {string} workspaceLocation
 * @returns {Promise<WorkspaceStructure>}
 */
async function workspaceStructure (workspaceLocation) {
  return void 0;
}

/**
 * @param {string} workspaceLocation
 * @returns {Promise<WorkspaceMeta>}
 */
async function workspaceMeta (workspaceLocation) {
  const { description, version, peerDependencies } = await fs.readJson(join(workspaceLocation, `package.json`))

  return { description, version, peerDependencies: Object.keys(peerDependencies ?? {}) }
}

console.log(await workspaceMeta("packages/authentication"))

```
