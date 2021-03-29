help:
    @echo "ThingCo shared frontend libraries"
    @echo "OS family: {{os_family()}}"
    @echo "OS: {{os()}} on {{arch()}}"
    @echo ""
    @just --list

update_yarn:
    yarn set version latest
    yarn plugin import version
    yarn plugin import typescript
    yarn plugin import workspace-tools
    yarn plugin import interactive-tools

# builds all libraries (_ie_ excluding the playground website)
build_all_libraries:
    @echo "Building all packages"
    @yarn workspaces foreach --exclude playground run build

# bundles a single package (for example "just build dataviz")
build package:
    @echo "Building {{package}}"
    @yarn {{package}} run build


# tests all packages
test_all:
    @echo "Testing all packages"
    @yarn workspaces foreach run test

# tests a single package (for example "just test @thingco/dataviz")
test package:
    @echo "Testing {{package}}"
    @yarn workspace {{package}} run test



