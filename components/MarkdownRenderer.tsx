import React from 'react';

interface MarkdownRendererProps {
  content: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  const renderLine = (line: string, index: number) => {
    if (line.startsWith('## ')) {
      return <h2 key={index} className="text-2xl font-bold mt-4 mb-2 text-indigo-300">{line.substring(3)}</h2>;
    }
    if (line.startsWith('# ')) {
      return <h1 key={index} className="text-3xl font-bold mt-6 mb-3 text-indigo-200">{line.substring(2)}</h1>;
    }
    if (line.startsWith('* ') || line.startsWith('- ')) {
      return (
        <li key={index} className="text-gray-300">
          {renderTextWithBold(line.substring(2))}
        </li>
      );
    }
    if (line.trim() === '') {
        return <br key={index} />;
    }
    return (
      <p key={index} className="text-gray-300 leading-relaxed">
        {renderTextWithBold(line)}
      </p>
    );
  };

  const renderTextWithBold = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-semibold text-gray-100">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  const blocks = content.split('\n');
  // Fix: Use React.ReactElement instead of JSX.Element to resolve "Cannot find namespace 'JSX'" error.
  const renderedBlocks: React.ReactElement[] = [];
  // Fix: Use React.ReactElement and correct the type for listItems. It only contains JSX elements from renderLine.
  let listItems: React.ReactElement[] = [];

  blocks.forEach((line, index) => {
    if (line.startsWith('* ') || line.startsWith('- ')) {
      listItems.push(renderLine(line, index));
    } else {
      if (listItems.length > 0) {
        renderedBlocks.push(<ul key={`ul-${index}`} className="list-disc pl-5 my-3 space-y-1">{listItems}</ul>);
        listItems = [];
      }
      renderedBlocks.push(renderLine(line, index));
    }
  });

  if (listItems.length > 0) {
    renderedBlocks.push(<ul key="ul-last" className="list-disc pl-5 my-3 space-y-1">{listItems}</ul>);
  }

  return <div className="prose prose-invert max-w-none">{renderedBlocks}</div>;
};

export default MarkdownRenderer;