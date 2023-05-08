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
  # yarn16 = pkgs.yarn.override (oldAttrs: {
  #   buildInputs = [ pkgs.nodejs-16_x ];
  # });
  # yarn16 = pkgs.yarn.override { buildInputs = [ pkgs.nodejs-16_x ]; };
  yarn16 = pkgs.yarn.overrideAttrs (finalAttrs: previousAttrs: {
    buildInputs = [ pkgs.nodejs-16_x ];
  });
in

pkgs.mkShell {
  buildInputs = [
	  pkgs.nodejs-16_x
	  pkgs.git
	  pkgs.ripgrep
    python
    yarn16
  ];
}
