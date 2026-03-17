import { useEditor, EditorContent } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import { useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
  Quote,
  Code,
  Minus,
  Link as LinkIcon,
  Link2Off,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Undo,
  Redo,
} from "lucide-react";

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
}

export function RichTextEditor({ content, onChange, placeholder, className }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Placeholder.configure({
        placeholder: placeholder ?? "Escriu el contingut del document...",
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: "text-secondary underline cursor-pointer" },
      }),
      Underline,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
    ],
    content,
    onUpdate: ({ editor: ed }) => {
      onChange(ed.getHTML());
    },
    editorProps: {
      attributes: {
        class: "prose prose-sm max-w-none focus:outline-none min-h-[400px] px-4 py-3",
      },
    },
  });

  // Sync external content changes (e.g., when loading a document)
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
    // Only sync when content prop changes from outside, not from editor
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content]);

  const setLink = useCallback(() => {
    if (!editor) return;
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("URL:", previousUrl);
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }, [editor]);

  if (!editor) return null;

  return (
    <div className={cn("rounded-xl border border-border bg-surface overflow-hidden", className)}>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 border-b border-border bg-bg px-2 py-1.5">
        <ToolbarGroup>
          <ToolbarButton
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            title="Desfer"
          >
            <Undo className="h-3.5 w-3.5" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            title="Refer"
          >
            <Redo className="h-3.5 w-3.5" />
          </ToolbarButton>
        </ToolbarGroup>

        <ToolbarDivider />

        <ToolbarGroup>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            active={editor.isActive("heading", { level: 1 })}
            title="Titol 1"
          >
            <Heading1 className="h-3.5 w-3.5" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            active={editor.isActive("heading", { level: 2 })}
            title="Titol 2"
          >
            <Heading2 className="h-3.5 w-3.5" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            active={editor.isActive("heading", { level: 3 })}
            title="Titol 3"
          >
            <Heading3 className="h-3.5 w-3.5" />
          </ToolbarButton>
        </ToolbarGroup>

        <ToolbarDivider />

        <ToolbarGroup>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            active={editor.isActive("bold")}
            title="Negreta (Ctrl+B)"
          >
            <Bold className="h-3.5 w-3.5" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            active={editor.isActive("italic")}
            title="Cursiva (Ctrl+I)"
          >
            <Italic className="h-3.5 w-3.5" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            active={editor.isActive("underline")}
            title="Subratllat (Ctrl+U)"
          >
            <UnderlineIcon className="h-3.5 w-3.5" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleStrike().run()}
            active={editor.isActive("strike")}
            title="Ratllat"
          >
            <Strikethrough className="h-3.5 w-3.5" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleCode().run()}
            active={editor.isActive("code")}
            title="Codi inline"
          >
            <Code className="h-3.5 w-3.5" />
          </ToolbarButton>
        </ToolbarGroup>

        <ToolbarDivider />

        <ToolbarGroup>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            active={editor.isActive("bulletList")}
            title="Llista"
          >
            <List className="h-3.5 w-3.5" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            active={editor.isActive("orderedList")}
            title="Llista numerada"
          >
            <ListOrdered className="h-3.5 w-3.5" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            active={editor.isActive("blockquote")}
            title="Cita"
          >
            <Quote className="h-3.5 w-3.5" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            title="Linia horitzontal"
          >
            <Minus className="h-3.5 w-3.5" />
          </ToolbarButton>
        </ToolbarGroup>

        <ToolbarDivider />

        <ToolbarGroup>
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign("left").run()}
            active={editor.isActive({ textAlign: "left" })}
            title="Alinear esquerra"
          >
            <AlignLeft className="h-3.5 w-3.5" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign("center").run()}
            active={editor.isActive({ textAlign: "center" })}
            title="Centrar"
          >
            <AlignCenter className="h-3.5 w-3.5" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign("right").run()}
            active={editor.isActive({ textAlign: "right" })}
            title="Alinear dreta"
          >
            <AlignRight className="h-3.5 w-3.5" />
          </ToolbarButton>
        </ToolbarGroup>

        <ToolbarDivider />

        <ToolbarGroup>
          <ToolbarButton
            onClick={setLink}
            active={editor.isActive("link")}
            title="Afegir enllac"
          >
            <LinkIcon className="h-3.5 w-3.5" />
          </ToolbarButton>
          {editor.isActive("link") && (
            <ToolbarButton
              onClick={() => editor.chain().focus().unsetLink().run()}
              title="Treure enllac"
            >
              <Link2Off className="h-3.5 w-3.5" />
            </ToolbarButton>
          )}
        </ToolbarGroup>
      </div>

      {/* Bubble menu (appears on text selection) */}
      <BubbleMenu editor={editor}>
        <div className="flex items-center gap-0.5 rounded-lg border border-border bg-surface p-1 shadow-lg">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            active={editor.isActive("bold")}
            size="sm"
          >
            <Bold className="h-3 w-3" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            active={editor.isActive("italic")}
            size="sm"
          >
            <Italic className="h-3 w-3" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            active={editor.isActive("underline")}
            size="sm"
          >
            <UnderlineIcon className="h-3 w-3" />
          </ToolbarButton>
          <ToolbarButton
            onClick={setLink}
            active={editor.isActive("link")}
            size="sm"
          >
            <LinkIcon className="h-3 w-3" />
          </ToolbarButton>
        </div>
      </BubbleMenu>

      {/* Editor content */}
      <EditorContent editor={editor} />
    </div>
  );
}

/* ── Toolbar sub-components ── */

function ToolbarButton({
  onClick,
  active,
  disabled,
  title,
  children,
  size = "md",
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  title?: string;
  children: React.ReactNode;
  size?: "sm" | "md";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={cn(
        "flex items-center justify-center rounded-md transition-colors",
        size === "sm" ? "h-6 w-6" : "h-7 w-7",
        active
          ? "bg-secondary/12 text-secondary"
          : "text-text-secondary hover:bg-overlay-hover hover:text-text-primary",
        disabled && "opacity-30 cursor-not-allowed",
      )}
    >
      {children}
    </button>
  );
}

function ToolbarGroup({ children }: { children: React.ReactNode }) {
  return <div className="flex items-center gap-0.5">{children}</div>;
}

function ToolbarDivider() {
  return <div className="mx-1 h-5 w-px bg-border" />;
}
