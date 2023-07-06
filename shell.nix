# shell.nix
let
  sources = import ./nix/sources.nix;
  pkgs16 = import sources.nixpkgs16 {};
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
  # yarn16 = pkgs.yarn.override (oldAttrs: {
  #   buildInputs = [ pkgs.nodejs-16_x ];
  # });
  # yarn16 = pkgs.yarn.override { buildInputs = [ pkgs.nodejs-16_x ]; };
  yarn16 = pkgs16.yarn.overrideAttrs (finalAttrs: previousAttrs: {
    buildInputs = [ pkgs16.nodejs-16_x ];
  });
in

pkgs.mkShell {
  buildInputs = [
	  pkgs16.nodejs-16_x
    yarn16
	  pkgs.git
	  pkgs.ripgrep
    pkgs.poetry
    python
  ];
}
