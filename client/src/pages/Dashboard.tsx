import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  Typography,
  TextField,
  IconButton,
  Chip,
  Button,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  Search as SearchIcon,
  Code as CodeIcon,
  Folder as FolderIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
} from "@mui/icons-material";
import { api } from "../services/api";
import { useQueryClient } from "@tanstack/react-query";

interface Snippet {
  id: string;
  title: string;
  description: string;
  language: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

interface Folder {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  snippetCount?: number;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [languageFilter, setLanguageFilter] = useState("all");
  const [filterType, setFilterType] = useState<"all" | "snippets" | "folders">(
    "all"
  );
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [snippetToDelete, setSnippetToDelete] = useState<string | null>(null);

  // Debug state changes
  useEffect(() => {
    console.log("State: snippetToDelete changed to", snippetToDelete);
  }, [snippetToDelete]);

  useEffect(() => {
    console.log("State: deleteDialogOpen changed to", deleteDialogOpen);
  }, [deleteDialogOpen]);

  // Fetch snippets
  const {
    data: snippetsData,
    isLoading: snippetsLoading,
    error: snippetsError,
  } = useQuery<Snippet[]>({
    queryKey: ["snippets"],
    queryFn: async () => {
      const response = await api.get("/snippets");
      return response.data.snippets || [];
    },
  });

  // Fetch folders
  const {
    data: foldersData,
    isLoading: foldersLoading,
    error: foldersError,
  } = useQuery<Folder[]>({
    queryKey: ["folders"],
    queryFn: async () => {
      const response = await api.get("/folders");
      return response.data || [];
    },
  });

  // Get unique languages for filter
  const languages = snippetsData
    ? [...new Set(snippetsData.map((snippet: Snippet) => snippet.language))]
    : [];

  // Filter and search logic
  const filteredSnippets = snippetsData?.filter((snippet: Snippet) => {
    const matchesSearch =
      snippet.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      snippet.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      snippet.tags.some((tag: string) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase())
      );
    const matchesLanguage =
      languageFilter === "all" || snippet.language === languageFilter;
    return matchesSearch && matchesLanguage;
  });

  const filteredFolders = foldersData?.filter(
    (folder: Folder) =>
      folder.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      folder.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isLoading = snippetsLoading || foldersLoading;
  const error = snippetsError || foldersError;

  // Delete snippet mutation
  const { mutate: deleteSnippet, isPending: isDeleting } = useMutation({
    mutationFn: async (snippetId: string) => {
      console.log("Mutation function called with ID:", snippetId);
      if (!snippetId) {
        console.error("Mutation called with undefined ID!");
        throw new Error("Snippet ID is undefined"); // Throw error to stop mutation
      }
      try {
        const response = await api.delete(`/snippets/${snippetId}`);
        console.log("Delete response:", response);
        return response;
      } catch (error) {
        console.error("Delete API error:", error);
        throw error;
      }
    },
    onSuccess: () => {
      console.log("Delete successful, invalidating queries");
      queryClient.invalidateQueries({ queryKey: ["snippets"] });
      setDeleteDialogOpen(false);
      setSnippetToDelete(null); // Explicitly reset on success
    },
    onError: (error) => {
      console.error("Delete mutation error:", error);
      // Keep dialog open and ID set on error to allow retry
    },
  });

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        Error loading dashboard data. Please try again later.
        <Button
          size="small"
          onClick={() => {
            queryClient.invalidateQueries({ queryKey: ["snippets"] });
            queryClient.invalidateQueries({ queryKey: ["folders"] });
          }}
          sx={{ ml: 2 }}
        >
          Retry
        </Button>
      </Alert>
    );
  }

  return (
    <Box>
      {/* Header and Controls */}
      <Box
        sx={{
          mb: 4,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h4" component="h1">
          Dashboard
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate("/snippets/new")}
        >
          New Snippet
        </Button>
      </Box>

      {/* Search and Filters */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            placeholder="Search snippets and folders..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <FormControl fullWidth>
            <InputLabel>Type</InputLabel>
            <Select
              value={filterType}
              label="Type"
              onChange={(e) =>
                setFilterType(e.target.value as "all" | "snippets" | "folders")
              }
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="snippets">Snippets</MenuItem>
              <MenuItem value="folders">Folders</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={3}>
          <FormControl fullWidth>
            <InputLabel>Language</InputLabel>
            <Select
              value={languageFilter}
              label="Language"
              onChange={(e) => setLanguageFilter(e.target.value)}
            >
              <MenuItem value="all">All Languages</MenuItem>
              {languages.map((language: string) => (
                <MenuItem key={language} value={language}>
                  {language}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      {/* Content Grid */}
      <Grid container spacing={3}>
        {/* Snippets */}
        {filterType !== "folders" &&
          filteredSnippets?.map((snippet: Snippet) => (
            <Grid item xs={12} sm={6} md={4} key={snippet.id}>
              <Card>
                <CardContent>
                  <Typography variant="h6" component="h2" gutterBottom>
                    {snippet.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 2 }}
                  >
                    {snippet.description}
                  </Typography>
                  <Box
                    sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 1 }}
                  >
                    <Chip
                      icon={<CodeIcon />}
                      label={snippet.language}
                      size="small"
                      color="primary"
                    />
                    {snippet.tags.map((tag: string) => (
                      <Chip key={tag} label={tag} size="small" />
                    ))}
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    Last updated:{" "}
                    {new Date(snippet.updatedAt).toLocaleDateString()}
                  </Typography>
                </CardContent>
                <CardActions>
                  <IconButton
                    size="small"
                    onClick={() => {
                      console.log("Edit button clicked:", snippet.id);
                      navigate(`/snippets/${snippet.id}`);
                    }}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => {
                      console.log(
                        "Delete icon clicked, setting ID:",
                        snippet.id
                      );
                      setSnippetToDelete(snippet.id);
                      setDeleteDialogOpen(true);
                    }}
                    sx={{
                      "&:hover": {
                        backgroundColor: "error.light",
                        color: "error.contrastText",
                      },
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </CardActions>
              </Card>
            </Grid>
          ))}

        {/* Folders */}
        {filterType !== "snippets" &&
          filteredFolders?.map((folder: Folder) => (
            <Grid item xs={12} sm={6} md={4} key={folder.id}>
              <Card>
                <CardContent>
                  <Typography variant="h6" component="h2" gutterBottom>
                    {folder.name}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 2 }}
                  >
                    {folder.description}
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <FolderIcon color="action" />
                    <Typography variant="body2" color="text.secondary">
                      {folder.snippetCount} snippets
                    </Typography>
                  </Box>
                </CardContent>
                <CardActions>
                  <Button
                    size="small"
                    onClick={() => navigate(`/folders/${folder.id}`)}
                  >
                    View Contents
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}

        {/* Empty State */}
        {((filterType !== "folders" &&
          (!filteredSnippets || filteredSnippets.length === 0)) ||
          (filterType !== "snippets" &&
            (!filteredFolders || filteredFolders.length === 0))) && (
          <Grid item xs={12}>
            <Box sx={{ textAlign: "center", py: 4 }}>
              <Typography variant="h6" color="text.secondary">
                No items found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Try adjusting your search or filters
              </Typography>
            </Box>
          </Grid>
        )}
      </Grid>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => {
          console.log("Closing dialog");
          setDeleteDialogOpen(false);
          setSnippetToDelete(null); // Reset ID on close as well
        }}
      >
        <DialogTitle>Delete Snippet</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this snippet? This action cannot be
            undone.
          </Typography>
          {/* Display the snippetToDelete ID for debugging */}
          {snippetToDelete && (
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ mt: 1, display: "block" }}
            >
              Deleting ID: {snippetToDelete}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              console.log("Cancel clicked");
              setDeleteDialogOpen(false);
              setSnippetToDelete(null); // Reset ID on cancel
            }}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
              console.log("Delete button clicked in dialog.");
              console.log(
                "Value of snippetToDelete at click:",
                snippetToDelete
              );
              if (snippetToDelete) {
                deleteSnippet(snippetToDelete);
              } else {
                // This case should ideally not happen with the disabled prop
                console.error(
                  "Delete clicked but snippetToDelete is null or undefined"
                );
              }
            }}
            color="error"
            disabled={isDeleting || !snippetToDelete} // Disable if deleting or no ID is set
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
