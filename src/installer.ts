import * as core from '@actions/core';
import * as tc from '@actions/tool-cache';
import * as path from 'path';
import * as child_process from 'child_process';
import { v4 as uuidv4 } from 'uuid';

export async function getProtoc(version: string) {
  const platformSuffix = ({
    win32: 'win64',
    darwin: 'osx-x86_64',
    linux: 'linux-x86_64',
  } as any)[process.platform];
  const downloadUrl = `https://github.com/protocolbuffers/protobuf/releases/download/v${version}/protoc-${version}-${platformSuffix}.zip`;
  const toolPath = tc.find('protoc', version) ? tc.find('protoc', version) : await downloadTool(downloadUrl, 'protoc', version);
  core.addPath(path.resolve(path.join(toolPath, 'bin')));
}

export async function getDartPlugin(version: string) {
  const platformSuffix = ({
    win32: 'windows-x64',
    darwin: 'macos-x64',
    linux: 'linux-x64',
  } as any)[process.platform];
  const downloadUrl = `https://storage.googleapis.com/dart-archive/channels/stable/release/${version}/sdk/dartsdk-${platformSuffix}-release.zip`;
  const dartPath = tc.find('dart', version) ? tc.find('dart', version) : await downloadTool(downloadUrl, 'dart', version);
  core.addPath(path.resolve(path.join(dartPath, 'dart-sdk', 'bin')));

  const dartPluginsPath = tc.find('dart-plugins', version) ? tc.find('dart-plugins', version) : await installDartPluginTool('dart-plugins', version);
  core.addPath(path.resolve(path.join(dartPluginsPath, 'bin')));
}

async function installDartPluginTool(name: string, version: string) {
  const pubCache = generateTempPath();
  process.env['PUB_CACHE'] = pubCache;
  child_process.execSync('pub global activate protoc_plugin', { stdio: 'inherit', encoding: 'utf-8' });
  return await tc.cacheDir(pubCache, name, version);
}

async function downloadTool(downloadUrl: string, name: string, version: string) {
  const zipFile = await tc.downloadTool(downloadUrl, generateTempPath());
  const destinationDir = await tc.extractZip(zipFile, generateTempPath());
  return await tc.cacheDir(destinationDir, name, version);
}

function generateTempPath() {
  return path.resolve(path.join(process.env['RUNNER_TEMP'] || '', `${uuidv4()}`));
}
