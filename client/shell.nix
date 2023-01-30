# shell.nix
let
  sources = import ./nix/sources.nix;
  pkgs = import sources.nixpkgs {};
  yarn16 = pkgs.yarn.overrideAttrs (finalAttrs: previousAttrs: {
    buildInputs = [ pkgs.nodejs-16_x ];
  });
in

pkgs.mkShell {
  buildInputs = [
	  pkgs.nodejs-16_x
	  pkgs.git
	  pkgs.ripgrep
    yarn16
  ];
}
