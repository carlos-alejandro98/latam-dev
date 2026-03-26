export interface DesignSystemComponent {
  name: string;
  webImportPath?: string;
  nativeImportPath?: string;
  hasChildren?: boolean;
}

export const DESIGN_SYSTEM_COMPONENTS: DesignSystemComponent[] = [
  {
    name: 'Alert',
    webImportPath: '@hangar/web-components/core/Alert',
    nativeImportPath: '@hangar/mobile-components',
    hasChildren: true,
  },
  { name: 'Avatar', nativeImportPath: '@hangar/mobile-components' },
  { name: 'BottomNavigation', nativeImportPath: '@hangar/mobile-components' },
  {
    name: 'Box',
    webImportPath: '@hangar/web-components/core/Box',
    nativeImportPath: '@hangar/mobile-components',
    hasChildren: true,
  },
  {
    name: 'Button',
    webImportPath: '@hangar/web-components/core/Button',
    nativeImportPath: '@hangar/mobile-components',
  },
  {
    name: 'CheckBox',
    webImportPath: '@hangar/web-components/core/Checkbox',
    nativeImportPath: '@hangar/mobile-components',
  },
  {
    name: 'Chip',
    webImportPath: '@hangar/web-components/core/Chip',
    nativeImportPath: '@hangar/mobile-components',
  },
  {
    name: 'Divider',
    webImportPath: '@hangar/web-components/core/Divider',
    nativeImportPath: '@hangar/mobile-components',
  },
  {
    name: 'IconButton',
    webImportPath: '@hangar/web-components/core/IconButton',
    nativeImportPath: '@hangar/mobile-components',
  },
  {
    name: 'Link',
    webImportPath: '@hangar/web-components/core/Link',
    nativeImportPath: '@hangar/mobile-components',
  },
  { name: 'Menu', nativeImportPath: '@hangar/mobile-components' },
  {
    name: 'MessageCard',
    webImportPath: '@hangar/web-components/core/MessageCard',
    nativeImportPath: '@hangar/mobile-components',
    hasChildren: true,
  },
  { name: 'Modal', webImportPath: '@hangar/web-components/core/Modal' },
  { name: 'Notification', nativeImportPath: '@hangar/mobile-components' },
  { name: 'Picker', nativeImportPath: '@hangar/mobile-components' },
  { name: 'Popover', webImportPath: '@hangar/web-components/core/Popover' },
  {
    name: 'Quantity',
    webImportPath: '@hangar/web-components/core/Quantity',
    nativeImportPath: '@hangar/mobile-components',
  },
  {
    name: 'RadioGroup',
    webImportPath: '@hangar/web-components/core/RadioGroup',
    nativeImportPath: '@hangar/mobile-components',
  },
  { name: 'Select', webImportPath: '@hangar/web-components/core/Select' },
  {
    name: 'Skeleton',
    webImportPath: '@hangar/web-components/core/Skeleton',
    nativeImportPath: '@hangar/mobile-components',
  },
  {
    name: 'Spinner',
    webImportPath: '@hangar/web-components/core/Spinner',
    nativeImportPath: '@hangar/mobile-components',
  },
  { name: 'Switch', nativeImportPath: '@hangar/mobile-components' },
  { name: 'Tabs', nativeImportPath: '@hangar/mobile-components' },
  {
    name: 'Tag',
    webImportPath: '@hangar/web-components/core/Tag',
    nativeImportPath: '@hangar/mobile-components',
  },
  {
    name: 'Text',
    webImportPath: '@hangar/web-components/core/Text',
    nativeImportPath: '@hangar/mobile-components',
    hasChildren: true,
  },
  { name: 'TextArea', nativeImportPath: '@hangar/mobile-components' },
  {
    name: 'TextField',
    webImportPath: '@hangar/web-components/core/TextField',
    nativeImportPath: '@hangar/mobile-components',
  },
  {
    name: 'TextList',
    webImportPath: '@hangar/web-components/core/TextList',
    nativeImportPath: '@hangar/mobile-components',
    hasChildren: true,
  },
  {
    name: 'Tile',
    webImportPath: '@hangar/web-components/core/Tile',
    nativeImportPath: '@hangar/mobile-components',
    hasChildren: true,
  },
];
