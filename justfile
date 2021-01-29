help:
    @echo "ThingCo shared frontend libraries"
    @echo "OS family: {{os_family()}}"
    @echo "OS: {{os()}} on {{arch()}}"
    @echo ""
    @just --list

# builds all packages
build_all:
    @echo "Building all packages"
    @yarn workspaces foreach run build

# bundles a single package (for example "just build @thingco/dataviz")
build package:
    @echo "Building {{package}}"
    @yarn workspace {{package}} run build

# tests all packages
test_all:
    @echo "Testing all packages"
    @yarn workspaces foreach run test

# tests a single package (for example "just test @thingco/dataviz")
test package:
    @echo "Testing {{package}}"
    @yarn workspace {{package}} run test

# runs development demo of a single package (for example "just demo @thingco/dataviz")
demo package:
    @echo "Demoing {{package}}"
    @yarn workspace {{package}} run develop


