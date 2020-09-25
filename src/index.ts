import * as core from '@actions/core';
import { getProtoc, getDartPlugin, getGRPC, getGRPCWeb } from './installer';

async function run() {
  try {
    const protocVersion = core.getInput('protoc-version') || '3.13.0';
    await getProtoc(protocVersion);

    const enableGRPC = core.getInput('enable-grpc') || false;
    if (enableGRPC) {
      const grpcVersion = core.getInput('grpc-version') || '1.32.0';
      await getGRPC(grpcVersion);
    }

    const enableGRPCWeb = core.getInput('enable-grpc-web') || false;
    if (enableGRPCWeb) {
      const grpcWebVersion = core.getInput('grpc-web-version') || '1.2.1';
      await getGRPCWeb(grpcWebVersion);
    }

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
