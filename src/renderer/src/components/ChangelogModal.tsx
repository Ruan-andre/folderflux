"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  List,
  ListItem,
  ListItemText,
  Stack,
  Typography,
} from "@mui/material";
import Link from "@mui/material/Link";
import Chip from "@mui/material/Chip";
import Icon from "../assets/icons";

type ChangelogModalProps = {
  open: boolean;
  onClose: () => void;
};

type Release = {
  tag_name: string;
  name: string;
  published_at: string;
  body: string | null;
  html_url?: string;
};

const BRAZILIAN_DATE = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

function formatDate(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return BRAZILIAN_DATE.format(d);
}

// Very light markdown renderer: handles headings (#, ##, ###), bullet lists (* or -) and inline links [text](url)
function renderInline(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  const regex = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/gi;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(text)) !== null) {
    const [full, label, href] = match;
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    parts.push(
      <Link key={`${href}-${match.index}`} href={href} target="_blank" rel="noopener" underline="hover">
        {label}
      </Link>
    );
    lastIndex = match.index + full.length;
  }
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }
  return parts;
}

function capitalizeFirst(text: string): string {
  const match = /[A-Za-zÀ-ÖØ-öø-ÿ]/.exec(text);
  if (!match) return text;
  const idx = match.index;
  return text.slice(0, idx) + text.charAt(idx).toUpperCase() + text.slice(idx + 1);
}

function capitalizeFirstNode(nodes: React.ReactNode[]): React.ReactNode[] {
  let done = false;
  return nodes.map((n) => {
    if (done) return n;
    if (typeof n === "string") {
      const cap = capitalizeFirst(n);
      if (cap !== n) done = true;
      return cap;
    }
    if (React.isValidElement(n)) {
      const child = (n.props as { children?: unknown }).children;
      if (typeof child === "string") {
        const cap = capitalizeFirst(child);
        if (cap !== child) {
          done = true;
          return React.cloneElement(n, undefined, cap);
        }
      }
    }
    return n;
  });
}

// Very light markdown renderer: block-level
function renderMarkdown(md: string | null): React.ReactNode {
  if (!md)
    return (
      <Typography variant="body1" color="text.secondary" sx={{ fontSize: 16, fontWeight: 400 }}>
        Sem notas de versão.
      </Typography>
    );

  const lines = md.split(/\r?\n/);
  const blocks: Array<React.ReactNode> = [];
  let listBuffer: string[] = [];

  const flushList = () => {
    if (listBuffer.length > 0) {
      blocks.push(
        <List dense sx={{ pl: 2 }} key={`list-${blocks.length}`}>
          {listBuffer.map((item, idx) => (
            <ListItem key={idx} sx={{ py: 0 }}>
              <ListItemText
                slotProps={{
                  primary: {
                    variant: "body1",
                    sx: { fontSize: 16, fontWeight: 400 },
                  },
                }}
                primary={<>{capitalizeFirstNode(renderInline(item))}</>}
              />
            </ListItem>
          ))}
        </List>
      );
      listBuffer = [];
    }
  };

  lines.forEach((raw, idx) => {
    const line = raw.trimEnd();
    if (line.length === 0) {
      flushList();
      blocks.push(<Box key={`br-${idx}`} sx={{ height: 8 }} />);
      return;
    }

    if (line.startsWith("* ") || line.startsWith("- ")) {
      listBuffer.push(line.slice(2));
      return;
    }

    const headingMatch = /^(#{1,6})\s+(.*)$/.exec(line);
    if (headingMatch) {
      flushList();
      const level = headingMatch[1].length;
      const text = headingMatch[2];
      const variant = level <= 2 ? "h5" : "h6";
      blocks.push(
        <Typography key={`h-${idx}`} variant={variant as "h5" | "h6"} fontWeight={600} sx={{ mt: 1 }}>
          {capitalizeFirstNode(renderInline(text))}
        </Typography>
      );
      return;
    }

    flushList();
    blocks.push(
      <Typography
        key={`p-${idx}`}
        variant="body1"
        sx={{ whiteSpace: "pre-wrap", fontSize: 16, fontWeight: 400 }}
      >
        {capitalizeFirstNode(renderInline(line))}
      </Typography>
    );
  });

  flushList();
  return <Stack spacing={0.5}>{blocks}</Stack>;
}

const ChangelogModal = ({ open, onClose }: ChangelogModalProps) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [releases, setReleases] = useState<Release[]>([]);
  const [offline, setOffline] = useState<boolean>(false);
  const [appVersion, setAppVersion] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;

    const fetchReleases = async () => {
      try {
        setLoading(true);
        setError(null);
        const isOffline =
          typeof navigator !== "undefined" && navigator && "onLine" in navigator ? !navigator.onLine : false;
        setOffline(isOffline);
        if (isOffline) {
          return; // não tenta buscar se offline
        }
        const res = await fetch("https://api.github.com/repos/Ruan-andre/folderflux/releases", {
          headers: {
            Accept: "application/vnd.github+json",
          },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: unknown = await res.json();
        if (!Array.isArray(data)) throw new Error("Resposta inesperada da API");
        const parsed: Release[] = data
          .map((r: unknown) => {
            const obj = r as Record<string, unknown>;
            const rel: Release = {
              tag_name: String(obj["tag_name"] ?? ""),
              name: String(obj["name"] ?? ""),
              published_at: String(obj["published_at"] ?? ""),
              body: (obj["body"] ?? null) as string | null,
              html_url: typeof obj["html_url"] === "string" ? (obj["html_url"] as string) : undefined,
            };
            return rel;
          })
          .filter((r) => r.tag_name);
        if (!cancelled) setReleases(parsed);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Erro ao buscar versões");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void fetchReleases();
    return () => {
      cancelled = true;
    };
  }, [open]);

  // Fetch app version once when component mounts
  useEffect(() => {
    const fn: unknown =
      typeof window !== "undefined"
        ? (window as unknown as { api?: { app?: { getVersion?: () => Promise<string> } } }).api?.app
            ?.getVersion
        : undefined;
    if (typeof fn === "function") {
      (fn as () => Promise<string>)()
        .then((v) => {
          if (typeof v === "string") setAppVersion(v);
        })
        .catch(() => void 0);
    }
  }, []);

  const content = useMemo(() => {
    if (offline) {
      return (
        <Alert severity="info">
          Você está offline. Conecte-se à internet para ver as atualizações mais recentes.
        </Alert>
      );
    }
    if (loading) {
      return (
        <Stack alignItems="center" justifyContent="center" sx={{ py: 6 }}>
          <CircularProgress size={28} />
          <Typography variant="body1" color="text.secondary" sx={{ mt: 2, fontSize: 16, fontWeight: 400 }}>
            Carregando versões...
          </Typography>
        </Stack>
      );
    }
    if (error) {
      return <Alert severity="error">Falha ao carregar o histórico: {error}</Alert>;
    }

    const normalize = (v: string): string => v.trim().replace(/^v/i, "");
    const normalizedApp = appVersion ? normalize(appVersion) : "";

    return (
      <Stack>
        {releases.map((rel, idx) => (
          <Accordion
            key={`${rel.tag_name}-${idx}`}
            disableGutters
            square={false}
            sx={{
              mt: idx === 0 ? 0 : 2,
              border: (theme) => `1px solid ${theme.palette.divider}`,
              borderRadius: 2,
              overflow: "hidden",
              boxShadow: (theme) => theme.shadows[1],
              transition: (theme) =>
                theme.transitions.create("box-shadow", { duration: theme.transitions.duration.shorter }),
              "&:hover": {
                boxShadow: (theme) => theme.shadows[3],
              },
              "&:before": { display: "none" },
            }}
          >
            <AccordionSummary
              expandIcon={<Icon icon="mdi:chevron-down" width="20" height="20" />}
              aria-controls={`panel-${idx}-content`}
              id={`panel-${idx}-header`}
              sx={{
                px: 2,
                py: 1.5,
                bgcolor: (theme) => theme.palette.action.hover,
              }}
            >
              <Stack direction="row" alignItems="center" sx={{ width: "100%" }}>
                <Stack spacing={0.5} sx={{ flex: 1, minWidth: 0 }}>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: 0 }}>
                    <Typography variant="subtitle1" fontWeight={700} sx={{ minWidth: 120 }}>
                      {rel.tag_name}
                    </Typography>
                    {normalizedApp && normalize(rel.tag_name) === normalizedApp && (
                      <Chip label="Versão atual" size="small" color="success" />
                    )}
                    {idx === 0 && normalize(rel.tag_name) !== normalizedApp && (
                      <Chip label="Mais recente" size="small" color="primary" />
                    )}
                  </Stack>
                  {rel.name && rel.name.trim() !== rel.tag_name.trim() && (
                    <Typography variant="body2" sx={{ fontSize: 15, fontWeight: 400 }} color="text.secondary">
                      {rel.name}
                    </Typography>
                  )}
                </Stack>
                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{ fontSize: 15, fontWeight: 400, mr: 1 }}
                >
                  Publicado em: {formatDate(rel.published_at)}
                </Typography>
                {rel.html_url && (
                  <Box onClick={(e) => e.stopPropagation()} sx={{ display: "flex", alignItems: "center" }}>
                    <Button
                      href={rel.html_url}
                      target="_blank"
                      rel="noopener"
                      size="small"
                      variant="text"
                      color="primary"
                      startIcon={<Icon icon="mdi:github" width="18" height="18" />}
                    >
                      Ver no GitHub
                    </Button>
                  </Box>
                )}
              </Stack>
            </AccordionSummary>
            <AccordionDetails sx={{ p: 0 }}>
              <Box sx={{ borderTop: (theme) => `1px solid ${theme.palette.divider}`, p: 2 }}>
                <Box sx={{ borderLeft: (theme) => `4px solid ${theme.palette.primary.main}`, pl: 2 }}>
                  {renderMarkdown(rel.body)}
                </Box>
              </Box>
            </AccordionDetails>
          </Accordion>
        ))}
      </Stack>
    );
  }, [loading, error, releases]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Histórico de versões</DialogTitle>
      <DialogContent dividers>{content}</DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="contained" color="error">
          Fechar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ChangelogModal;
