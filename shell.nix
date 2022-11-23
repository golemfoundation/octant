# shell.nix
let
  sources = import ./nix/sources.nix;
  pkgs = import sources.nixpkgs {};
  python = pkgs.python310.withPackages (ps: with ps; [
    web3
    pip
    requests
    flask
    pytest
    setuptools
    importmagic # for emacs
    epc # for emacs
  ]);
in

pkgs.mkShell {
  buildInputs = [
	  pkgs.nodejs-16_x
    pkgs.yarn
	  pkgs.git
	  pkgs.ripgrep
    python
  ];
}
