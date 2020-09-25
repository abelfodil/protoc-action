import * as core from '@actions/core';
import * as tc from '@actions/tool-cache';
import * as path from 'path';
import * as child_process from 'child_process';
import { exec } from '@actions/exec';
import { v4 as uuidv4 } from 'uuid';

export async function getProtoc(version: string) {
  const platformSuffix = ({
    win32: 'win64',
    darwin: 'osx-x86_64',
    linux: 'linux-x86_64',
  } as any)[process.platform];
  const downloadUrl = `https://github.com/protocolbuffers/protobuf/releases/download/v${version}/protoc-${version}-${platformSuffix}.zip`;
  const toolPath = tc.find('protoc', version) ? tc.find('protoc', version) : await downloadZippedTool(downloadUrl, 'protoc', version);
  core.addPath(path.resolve(path.join(toolPath, 'bin')));
}

export async function getGRPC(version: string) {
  const name = 'grpc';
  let toolPath = tc.find(name, version);
  if (!toolPath) {
    const srcDir = path.resolve(path.join('grpc'));
    await exec('git', ['clone', '--recurse-submodules', '-b', 'v' + version, 'https://github.com/grpc/grpc', srcDir]);
    await exec('make', ['plugins', '-j'], { cwd: srcDir });

    const outputDir = path.join(srcDir, 'bins', 'opt');
    toolPath = await tc.cacheDir(outputDir, name, version);
  }

  core.addPath(path.resolve(toolPath));
}

export async function getGRPCWeb(version: string) {
  const platformSuffix = ({
    win32: 'windows-x86_64.exe',
    darwin: 'darwin-x86_64',
    linux: 'linux-x86_64',
  } as any)[process.platform];

  const downloadUrl = `https://github.com/grpc/grpc-web/releases/download/${version}/protoc-gen-grpc-web-${version}-${platformSuffix}`;
  const name = 'protoc-gen-grpc-web';
  const toolPath = tc.find(name, version) ? tc.find(name, version) : await downloadTool(downloadUrl, name, version);

  core.addPath(path.resolve(path.join(toolPath)));
}

export async function getDartPlugin(version: string) {
  const platformSuffix = ({
    win32: 'windows-x64',
    darwin: 'macos-x64',
    linux: 'linux-x64',
  } as any)[process.platform];
  const downloadUrl = `https://storage.googleapis.com/dart-archive/channels/stable/release/${version}/sdk/dartsdk-${platformSuffix}-release.zip`;
  const dartPath = tc.find('dart', version) ? tc.find('dart', version) : await downloadZippedTool(downloadUrl, 'dart', version);
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

async function downloadZippedTool(downloadUrl: string, name: string, version: string) {
  const zipFile = await tc.downloadTool(downloadUrl, generateTempPath());
  const destinationDir = await tc.extractZip(zipFile, generateTempPath());
  return await tc.cacheDir(destinationDir, name, version);
}

async function downloadTool(downloadUrl: string, name: string, version: string) {
  const destinationFile = await tc.downloadTool(downloadUrl, generateTempPath());
  if (process.platform !== 'win32') {
    await exec('chmod', ['+x', destinationFile]);
  }
  return await tc.cacheFile(destinationFile, name, name, version);
}

function generateTempPath() {
  return path.resolve(path.join(process.env['RUNNER_TEMP'] || '', `${uuidv4()}`));
}
