import * as core from '@actions/core';
import { getProtoc, getDartPlugin } from './installer';

async function run() {
  try {
    const protocVersion = core.getInput('protoc-version') || '3.13.0';
    await getProtoc(protocVersion);

    const enableDart = core.getInput('enable-dart') || false;
    if (enableDart) {
      const dartVersion = core.getInput('dart-version') || '2.9.2';
      await getDartPlugin(dartVersion);
    }
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
