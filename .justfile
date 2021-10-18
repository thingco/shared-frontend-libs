# To automate commit/build/test/deploy/publish tasks, it is critical that a known
# setup is used. This tsk simply ensures that all is as it should be: everything
# it describes *should* already be in place, but if it isn't, this should fix it.
setup:
	# Install everything
	yarn
	# Make sure the git config for hooks is set to the .git-hooks directory: git
	# will deliberately not pick up anything in .git/hooks, so to allow custom
	# hooks to be registered we set the core.hooksPath in the repo config
	git config core.hooksPath ./.git-hooks
