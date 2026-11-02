// Cucumber owns scenario execution; ts-node lets it load the TypeScript steps and hooks.
module.exports = {
  default: {
    paths: ["features/**/*.feature"],
    requireModule: ["ts-node/register"],
    require: ["step-definitions/**/*.ts", "hooks/**/*.ts"],
    format: ["progress"],
    failFast: false
  }
};
