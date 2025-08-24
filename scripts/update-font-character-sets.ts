/**
 * Font Character Sets Auto-Update Script
 *
 * Automatically scans TSX/JSX files for Caveat font usage and updates
 * the CHARACTER_SETS in generate-font-subsets.ts accordingly.
 */

import {
  Project,
  SyntaxKind,
  JsxElement,
  JsxSelfClosingElement,
  JsxText,
  JsxAttribute,
  StringLiteral,
  AsExpression,
  SourceFile,
  JsxExpression,
} from 'ts-morph';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');

type FontType = 'header' | 'comprehensive';
type FontSource = 'direct-text' | 'prop-value' | 'recursive-prop';

type FontUsage = {
  type: FontType;
  text: string;
  file: string;
  relativePath: string;
  component: string;
  source: FontSource;
};

type ComponentInfo = {
  name: string;
  filePath: string;
  relativePath: string;
  usedProps: Set<string>; // Props that are actually rendered in font-accent elements
};

type PropUsage = {
  componentName: string;
  propName: string;
  value: string;
  isStatic: boolean;
  filePath: string;
  relativePath: string;
};

/**
 * Extract static text from JSX element, preserving spaces around JSX expressions
 */
const extractStaticText = (element: JsxElement | JsxSelfClosingElement): string => {
  if (element.getKind() === SyntaxKind.JsxSelfClosingElement) {
    return '';
  }

  const jsxElement = element as JsxElement;
  const children = jsxElement.getJsxChildren();
  let text = '';

  for (let i = 0; i < children.length; i++) {
    const child = children[i];
    if (!child) continue;

    if (child.getKind() === SyntaxKind.JsxText) {
      const jsxText = child as JsxText;
      let childText = jsxText.getLiteralText();

      // If this is the first or last child, trim outer whitespace
      if (i === 0) {
        childText = childText.trimStart();
      }
      if (i === children.length - 1) {
        childText = childText.trimEnd();
      }

      text += childText;
    } else if (child.getKind() === SyntaxKind.JsxElement) {
      // Recursively extract text from nested elements
      text += extractStaticText(child as JsxElement);
    } else if (child.getKind() === SyntaxKind.JsxExpression) {
      // For JSX expressions, add a placeholder space to maintain word separation
      // This helps with cases like "Page {page} of {total}" -> "Page  of"
      const prevChild = i > 0 ? children[i - 1] : null;
      const nextChild = i < children.length - 1 ? children[i + 1] : null;

      if (prevChild && prevChild.getKind() === SyntaxKind.JsxText) {
        const prevText = (prevChild as JsxText).getLiteralText();
        if (!prevText.endsWith(' ')) {
          text += ' ';
        }
      }

      if (nextChild && nextChild.getKind() === SyntaxKind.JsxText) {
        const nextText = (nextChild as JsxText).getLiteralText();
        if (!nextText.startsWith(' ')) {
          text += ' ';
        }
      }
    }
  }

  return text.replace(/\s+/g, ' ').trim(); // Normalize multiple spaces to single space
};

/**
 * Check if className contains font-accent or font-accent-header
 */
const getFontType = (className: string): FontType | null => {
  if (className.includes('font-accent-header')) {
    return 'header';
  } else if (className.includes('font-accent')) {
    return 'comprehensive';
  }
  return null;
};

/**
 * Extract JSX expressions (like {label}) from JSX element content
 */
const extractJsxExpressions = (element: JsxElement | JsxSelfClosingElement): string[] => {
  if (element.getKind() === SyntaxKind.JsxSelfClosingElement) {
    return [];
  }

  const jsxElement = element as JsxElement;
  const children = jsxElement.getJsxChildren();
  const expressions: string[] = [];

  for (const child of children) {
    if (child.getKind() === SyntaxKind.JsxExpression) {
      const jsxExpression = child as JsxExpression;
      const expression = jsxExpression.getExpression();
      if (expression && expression.getKind() === SyntaxKind.Identifier) {
        expressions.push(expression.getText());
      }
    } else if (child.getKind() === SyntaxKind.JsxElement) {
      // Recursively extract from nested elements
      expressions.push(...extractJsxExpressions(child as JsxElement));
    }
  }

  return expressions;
};

/**
 * Analyze component prop dependencies for font-accent elements
 */
const analyzeComponentPropDependencies = (sourceFiles: SourceFile[]): ComponentInfo[] => {
  const componentInfos: ComponentInfo[] = [];

  for (const sourceFile of sourceFiles) {
    const filePath = sourceFile.getFilePath();
    const relativePath = path.relative(projectRoot, filePath);

    // Find all function components (export const ComponentName = ...)
    const variableDeclarations = sourceFile.getVariableDeclarations?.() || [];

    for (const varDecl of variableDeclarations) {
      const initializer = varDecl.getInitializer();
      if (initializer && initializer.getKind() === SyntaxKind.ArrowFunction) {
        const componentName = varDecl.getName();
        const usedProps = new Set<string>();

        // Find JSX elements with font-accent classes within this component
        const jsxElements = initializer.getDescendantsOfKind(SyntaxKind.JsxElement);
        const jsxSelfClosingElements = initializer.getDescendantsOfKind(
          SyntaxKind.JsxSelfClosingElement,
        );

        [...jsxElements, ...jsxSelfClosingElements].forEach((element) => {
          const openingElement =
            element.getKind() === SyntaxKind.JsxElement
              ? (element as JsxElement).getOpeningElement()
              : (element as JsxSelfClosingElement);

          const attributes = openingElement.getAttributes();

          // Check if this element has font-accent classes
          let hasFontAccent = false;
          for (const attr of attributes) {
            if (attr.getKind() === SyntaxKind.JsxAttribute) {
              const jsxAttr = attr as JsxAttribute;
              const attrName = jsxAttr.getNameNode().getText();

              if (attrName === 'className' || attrName === 'class') {
                const initializer = jsxAttr.getInitializer();
                if (initializer && initializer.getKind() === SyntaxKind.StringLiteral) {
                  const stringLiteral = initializer as StringLiteral;
                  const className = stringLiteral.getLiteralValue();
                  if (getFontType(className)) {
                    hasFontAccent = true;
                    break;
                  }
                }
              }
            }
          }

          if (hasFontAccent) {
            // Extract JSX expressions from this font-accent element
            const expressions = extractJsxExpressions(element);
            expressions.forEach((expr) => usedProps.add(expr));
          }
        });

        if (usedProps.size > 0) {
          componentInfos.push({
            name: componentName,
            filePath,
            relativePath,
            usedProps,
          });
        }
      }
    }
  }

  return componentInfos;
};

/**
 * Extract string literals from JSX element props
 */
const extractPropsStringLiterals = (element: JsxElement | JsxSelfClosingElement): string[] => {
  const openingElement =
    element.getKind() === SyntaxKind.JsxElement
      ? (element as JsxElement).getOpeningElement()
      : (element as JsxSelfClosingElement);

  const attributes = openingElement.getAttributes();
  const stringLiterals: string[] = [];

  for (const attr of attributes) {
    if (attr.getKind() === SyntaxKind.JsxAttribute) {
      const jsxAttr = attr as JsxAttribute;
      const initializer = jsxAttr.getInitializer();

      if (initializer && initializer.getKind() === SyntaxKind.StringLiteral) {
        const stringLiteral = initializer as StringLiteral;
        const value = stringLiteral.getLiteralValue();

        // Only collect meaningful text (not just classes, short values, or alignments)
        if (
          value.length > 4 &&
          !value.includes('-') &&
          !value.includes('.') &&
          !['left', 'right', 'center', 'top', 'bottom'].includes(value.toLowerCase()) &&
          !/^[a-z]+$/.test(value)
        ) {
          // Skip single words that are likely props like "align"
          stringLiterals.push(value);
        }
      }
    }
  }

  return stringLiterals;
};

/**
 * Find usages of a specific component and extract static prop values
 */
const findComponentUsages = (project: Project, componentInfo: ComponentInfo): PropUsage[] => {
  const propUsages: PropUsage[] = [];
  const componentName = componentInfo.name;

  // Get all source files
  const sourceFiles = project.getSourceFiles([
    'app/**/*.{ts,tsx,js,jsx}',
    'components/**/*.{ts,tsx,js,jsx}',
  ]);

  for (const sourceFile of sourceFiles) {
    const filePath = sourceFile.getFilePath();
    const relativePath = path.relative(projectRoot, filePath);

    // Find JSX elements that match the component name
    const jsxElements = sourceFile.getDescendantsOfKind(SyntaxKind.JsxElement);
    const jsxSelfClosingElements = sourceFile.getDescendantsOfKind(
      SyntaxKind.JsxSelfClosingElement,
    );

    [...jsxElements, ...jsxSelfClosingElements].forEach((element) => {
      const openingElement =
        element.getKind() === SyntaxKind.JsxElement
          ? (element as JsxElement).getOpeningElement()
          : (element as JsxSelfClosingElement);

      const tagName = openingElement.getTagNameNode().getText();

      if (tagName === componentName) {
        const attributes = openingElement.getAttributes();

        // Check each prop that this component uses in font-accent elements
        for (const propName of Array.from(componentInfo.usedProps)) {
          for (const attr of attributes) {
            if (attr.getKind() === SyntaxKind.JsxAttribute) {
              const jsxAttr = attr as JsxAttribute;
              const attrName = jsxAttr.getNameNode().getText();

              if (attrName === propName) {
                const initializer = jsxAttr.getInitializer();

                if (initializer && initializer.getKind() === SyntaxKind.StringLiteral) {
                  // Static string literal
                  const stringLiteral = initializer as StringLiteral;
                  const value = stringLiteral.getLiteralValue();

                  // Apply the same filtering as extractPropsStringLiterals
                  if (
                    value.length > 4 &&
                    !value.includes('-') &&
                    !value.includes('.') &&
                    !['left', 'right', 'center', 'top', 'bottom'].includes(value.toLowerCase()) &&
                    !/^[a-z]+$/.test(value)
                  ) {
                    propUsages.push({
                      componentName,
                      propName,
                      value,
                      isStatic: true,
                      filePath,
                      relativePath,
                    });
                  }
                } else if (initializer && initializer.getKind() === SyntaxKind.JsxExpression) {
                  // Dynamic expression - could potentially be traced further
                  const jsxExpression = initializer as JsxExpression;
                  const expression = jsxExpression.getExpression();
                  if (expression && expression.getKind() === SyntaxKind.Identifier) {
                    // For now, we'll skip dynamic expressions
                    // Future enhancement: trace variable sources
                    console.log(
                      `⚠️  Skipping dynamic prop: ${componentName}.${propName} = {${expression.getText()}} in ${relativePath}`,
                    );
                  }
                }
              }
            }
          }
        }
      }
    });
  }

  return propUsages;
};

/**
 * Scan TSX/JSX files for Caveat font usage with recursive props tracing
 */
const scanForFontUsage = (): FontUsage[] => {
  const project = new Project({
    tsConfigFilePath: path.join(projectRoot, 'tsconfig.json'),
  });

  const usages: FontUsage[] = [];

  // Scan all TSX/JSX files
  const sourceFiles = project.getSourceFiles([
    'app/**/*.{ts,tsx,js,jsx}',
    'components/**/*.{ts,tsx,js,jsx}',
  ]);

  console.log('🔍 Step 1: Analyzing component prop dependencies...');
  const componentInfos = analyzeComponentPropDependencies(sourceFiles);

  console.log('🔍 Step 2: Finding component usages and extracting prop values...');
  const allPropUsages: PropUsage[] = [];
  for (const componentInfo of componentInfos) {
    const propUsages = findComponentUsages(project, componentInfo);
    allPropUsages.push(...propUsages);
  }

  console.log('🔍 Step 3: Scanning for direct font usage...');
  for (const sourceFile of sourceFiles) {
    const filePath = sourceFile.getFilePath();
    const fileName = path.basename(filePath);
    const relativePath = path.relative(projectRoot, filePath);

    // Find JSX elements with font-accent classes
    const jsxElements = sourceFile.getDescendantsOfKind(SyntaxKind.JsxElement);
    const jsxSelfClosingElements = sourceFile.getDescendantsOfKind(
      SyntaxKind.JsxSelfClosingElement,
    );

    [...jsxElements, ...jsxSelfClosingElements].forEach((element) => {
      const openingElement =
        element.getKind() === SyntaxKind.JsxElement
          ? (element as JsxElement).getOpeningElement()
          : (element as JsxSelfClosingElement);

      const attributes = openingElement.getAttributes();

      // Check if this element has font-accent classes
      let fontType: FontType | null = null;
      for (const attr of attributes) {
        if (attr.getKind() === SyntaxKind.JsxAttribute) {
          const jsxAttr = attr as JsxAttribute;
          const attrName = jsxAttr.getNameNode().getText();

          if (attrName === 'className' || attrName === 'class') {
            const initializer = jsxAttr.getInitializer();
            if (initializer && initializer.getKind() === SyntaxKind.StringLiteral) {
              const stringLiteral = initializer as StringLiteral;
              const className = stringLiteral.getLiteralValue();
              fontType = getFontType(className);
              break;
            }
          }
        }
      }

      if (fontType) {
        // Extract direct text content
        const directText = extractStaticText(element);
        if (directText) {
          usages.push({
            type: fontType,
            text: directText,
            file: fileName,
            relativePath,
            component: path.basename(fileName, path.extname(fileName)),
            source: 'direct-text',
          });
        }

        // Extract text from props (for components that receive text via props)
        const propStringLiterals = extractPropsStringLiterals(element);
        for (const propText of propStringLiterals) {
          usages.push({
            type: fontType,
            text: propText,
            file: fileName,
            relativePath,
            component: path.basename(fileName, path.extname(fileName)),
            source: 'prop-value',
          });
        }
      }
    });
  }

  console.log('🔍 Step 4: Adding recursive prop usage results...');
  // Add prop-based text from component usages (recursive tracing results)
  for (const propUsage of allPropUsages) {
    // Determine font type based on the component that uses the props
    // For now, assume comprehensive (since header components usually don't use props)
    const fontType = 'comprehensive';

    usages.push({
      type: fontType,
      text: propUsage.value,
      file: path.basename(propUsage.filePath),
      relativePath: propUsage.relativePath,
      component: propUsage.componentName,
      source: 'recursive-prop',
    });
  }

  return usages;
};

/**
 * Update CHARACTER_SETS in generate-font-subsets.ts
 */
const updateCharacterSets = (usages: FontUsage[]): void => {
  const project = new Project();
  const fontSubsetsFile = project.addSourceFileAtPath(
    path.join(__dirname, 'generate-font-subsets.ts'),
  );

  // Group usages by type
  const headerTexts = usages.filter((usage) => usage.type === 'header').map((usage) => usage.text);

  // Find the CHARACTER_SETS variable declaration
  const characterSetsVar = fontSubsetsFile
    .getVariableDeclarations()
    .find((decl) => decl.getName() === 'CHARACTER_SETS');

  if (!characterSetsVar) {
    throw new Error('CHARACTER_SETS variable not found in generate-font-subsets.ts');
  }

  const initializer = characterSetsVar.getInitializer();
  if (!initializer) {
    throw new Error('CHARACTER_SETS has no initializer');
  }

  // Handle both direct object literal and "as const" assertion
  let objectLiteral = initializer;
  if (initializer.getKind() === SyntaxKind.AsExpression) {
    const asExpression = initializer as AsExpression;
    objectLiteral = asExpression.getExpression();
  }

  if (objectLiteral.getKind() !== SyntaxKind.ObjectLiteralExpression) {
    throw new Error('CHARACTER_SETS is not an object literal');
  }

  // Build unique character sets
  const headerChars = [...new Set(headerTexts.join(''))].sort().join('');

  // Group texts by component dynamically
  const textsByComponent = new Map<string, Set<string>>();

  // Group comprehensive texts by component
  for (const usage of usages.filter((u) => u.type === 'comprehensive')) {
    if (!textsByComponent.has(usage.component)) {
      textsByComponent.set(usage.component, new Set());
    }
    textsByComponent.get(usage.component)!.add(usage.text);
  }

  // Sort components alphabetically for consistent output
  const sortedComponents = Array.from(textsByComponent.keys()).sort();

  // Generate comprehensive character sections dynamically
  const comprehensiveEntries = sortedComponents
    .map((component) => {
      const texts = Array.from(textsByComponent.get(component)!);
      const textEntries = texts.map((text) => `'${text}',`).join('\n      ');

      // Find the relative file path for this component
      const componentUsage = usages.find(
        (u) => u.component === component && u.type === 'comprehensive',
      );
      const relativeFilePath = componentUsage ? `${componentUsage.relativePath}` : '';

      return `      // ${component} (${relativeFilePath})\n      ${textEntries}`;
    })
    .join('\n');

  // Update the object literal
  const newCharacterSets = `{
  // Minimal subset for header logo only
  header: {
    name: 'caveat-header',
    characters: '${headerChars}',
  },

  // Comprehensive subset for all components (excluding header texts)
  comprehensive: {
    name: 'caveat-comprehensive',
    characters: [
${comprehensiveEntries}
      // Numbers for years and pagination (0-9)
      '0123456789',
    ].join(''),
  },
} as const`;

  initializer.replaceWithText(newCharacterSets);

  // Save the file
  fontSubsetsFile.saveSync();

  console.log('✅ CHARACTER_SETS updated successfully!');
};

/**
 * Main execution function
 */
const main = (): void => {
  console.log('🔍 Scanning for Caveat font usage...');

  try {
    const usages = scanForFontUsage();

    console.log(`\n📊 Found ${usages.length} font usage(s):`);
    for (const usage of usages) {
      const sourceIcon = usage.source === 'direct-text' ? '📝' : '🔗';
      console.log(
        `  ${sourceIcon} ${usage.type}: "${usage.text}" in ${usage.file} (${usage.source})`,
      );
    }

    console.log('\n🔄 Updating CHARACTER_SETS...');
    updateCharacterSets(usages);

    console.log('\n✨ Font character sets auto-update completed!');
    console.log('\n📋 Next Steps:');
    console.log('1. Run `pnpm generate:fonts` to generate new font subsets');
    console.log('2. Verify the updated CHARACTER_SETS in generate-font-subsets.ts');
  } catch (error) {
    console.error('💥 Font character sets update failed:', (error as Error).message);
    process.exit(1);
  }
};

// Run the script
if (import.meta.url === `file://${process.argv[1]}`) {
  try {
    main();
  } catch (error) {
    console.error('💥 Script execution failed:', (error as Error).message);
    process.exit(1);
  }
}
