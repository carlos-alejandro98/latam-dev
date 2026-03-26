import { execSync } from 'child_process';

interface CommandMap {
  build: () => void;
  verify: () => void;
  props: () => void;
  check: () => void;
  all: () => void;
}

const run = (command: string): void => {
  execSync(command, { stdio: 'inherit' });
};

const commands: CommandMap = {
  build: () => run('tsx scripts/design-system/build.ts'),

  verify: () => run('tsx scripts/design-system/verify.ts'),

  props: () => run('tsx scripts/design-system/props-snapshot.ts'),

  check: () => {
    commands.verify();
    commands.props();
  },

  all: () => {
    commands.build();
    commands.verify();
    commands.props();
  },
};

export function runDesignSystem(): void {
  const command = process.argv[2] || 'all';

  if (!commands[command as keyof CommandMap]) {
    console.log(`
Design System CLI

Available commands:

ds build     → Generate wrappers
ds verify    → Verify bundle size + Hangar version
ds props     → Deep prop diff
ds check     → Verify + props
ds           → Full pipeline
`);
    process.exit(1);
  }

  try {
    commands[command as keyof CommandMap]();
    console.log('\n✅ Design System CLI finished successfully');
  } catch {
    console.error('\n❌ Design System CLI failed');
    process.exit(1);
  }
}
